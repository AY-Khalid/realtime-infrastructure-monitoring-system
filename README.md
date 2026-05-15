# Pulse, Real-Time Infrastructure Dashboard

A production-grade real-time data visualization platform that simulates a live infrastructure monitoring console. It is built with Vue 3, TypeScript, and Vite, and it streams synthetic telemetry continuously through a tightly engineered pipeline of bounded buffers, throttled reactivity, and Canvas-rendered ECharts.

The look and feel target the same design vocabulary used by Datadog, Grafana, Vercel Analytics, and Linear. The result is a quiet, command-center aesthetic with subtle motion, dark-first theming, and dense but readable information layout.

## Quick start

```bash
# install
npm install

# dev server (http://localhost:5173)
npm run dev

# production build
npm run build

# preview the production build
npm run preview

# strict type-check only
npm run type-check
```

Node 18+ is required.

## What it does

The dashboard simulates a live telemetry stream from a global fleet of servers across seven regions. Every second a new telemetry frame arrives carrying a CPU, memory, network, and error snapshot, per-server breakdowns, a regional heatmap, and per-region health scores. Activity events such as CPU spikes, recoveries, suspicious traffic, and deploys arrive on an irregular cadence.

The UI surfaces this through several connected pieces.

Six animated KPI cards run across the top with sparklines, trend deltas, and live-tweened counters.

Five charts are powered by ECharts on Canvas. There is a composite CPU, Memory, and Errors line chart with a secondary axis for requests, a gradient memory area chart, a stacked inbound and outbound network bar chart, a regional load heatmap, and a six-dimension regional radar.

A virtualized live activity feed sits below them with severity badges, debounced search, and severity filtering. Memory is hard-capped at five hundred events.

A TanStack-powered fleet table at the bottom supports sorting, filtering, pagination, sticky headers, and per-cell utilization bars.

A reconnect banner surfaces connection state transitions through connecting, connected, reconnecting, and disconnected.

A theme toggle drives the light and dark palettes entirely from CSS custom properties so charts re-resolve their colors on theme change.

Stream controls let the user pause and resume the simulation, and deliberately trigger a disconnect for testing the reconnect behavior.

## Architecture

```
src/
├── app/               bootstrapping: providers, router, layouts, theme registry
├── components/        presentational and container components, grouped by feature
│   ├── charts/        ECharts chart components (each is option-only, no state)
│   ├── cards/         KPI cards and grid
│   ├── controls/      time range, dataset toggles, stream control, theme
│   ├── feed/          activity feed, filters, virtualized rows
│   ├── table/         TanStack table, filters, cell renderers
│   ├── ui/            design-system primitives (Card, Button, Badge, etc.)
│   └── layout/        AppHeader, AppSidebar
├── composables/       Vue composables, single-purpose, reusable
├── services/
│   ├── streaming/     streaming engine, the orchestration point
│   ├── websocket/     transport (currently mocked, websocket-shaped)
│   └── mock/          telemetry and activity generators
├── stores/            Pinia stores (connection, metrics, activity, ui)
├── types/             all TS types and Zod schemas
├── utils/             ring buffer, throttle, formatters, safe parse, etc.
├── constants/         app, streaming, regions, time ranges, activity, chart tokens
├── data/              seed inventory (server IDs, heatmap shape)
├── workers/           optional aggregation worker (future-proofing seam)
├── pages/             route-level views (Dashboard)
└── assets/            CSS tokens and design-system base styles
```

### Layered separation of concerns

The transport layer in `services/websocket` is a `MockTransport` that mimics a real WebSocket with `open()`, `send()`, `close()`, `onMessage`, `onClose`, and `onLatency`. It models latency, jitter, sporadic disconnects, and occasionally corrupts payloads so the validation layer is actually exercised.

The generator in `services/mock` is `TelemetryGenerator`, a stateful simulator that runs coherent random walks per metric, injects anomaly bursts, and emits per-server and per-region breakdowns. It is fully encapsulated; consumers only ever see `TelemetryPayload` and `ActivityPayload` objects.

The streaming engine in `services/streaming` is the single orchestration point. It owns the simulation timers, the transport, and the connection finite-state-machine. It validates every inbound payload through Zod before fan-out. The public API is small (`start`, `stop`, `pause`, `resume`, `onPayload`, `onState`) so it can be replaced by a real WebSocket transport without touching consumers.

The stores in `stores/` are Pinia stores and they are the single source of truth for the UI. The `metrics` store holds the ring-buffered time-series and latest snapshot. The `activity` store holds the bounded event log and filter state. The `connection` store holds the FSM state. The `ui` store holds purely client-side preferences like time range, dataset toggles, and sidebar state.

The composables in `composables/` provide reusable behavior. `useStreaming` wires the engine to the stores, `useChartTokens` exposes the live theme tokens to chart options, `useAnimatedNumber` tweens KPI values, `useVirtualList` powers the feed, and `useTheme` manages dark and light mode persistence.

The components in `components/` consume stores via `storeToRefs` and composables. They are thin by design. They own presentation and user input, never business state.

### Connection state machine

```
                ┌──── start() ────────┐
                ▼                     │
   idle ──► connecting ──► connected ─┼──► paused
                │              │      │
                ▼              ▼      │
        reconnecting ◄── (drop) ──────┘
            │       \
            │        \── max attempts → disconnected
            └── retry (exponential backoff w/ jitter)
```

Reconnect uses 800ms exponential backoff, jittered plus or minus 15%, capped at 12 seconds and 8 attempts. Each attempt is published to the connection store so the banner can show the live countdown.

## Rendering and performance strategy

This is the part of the codebase that mattered most. The dashboard has to remain smooth indefinitely while a 1Hz telemetry stream and an irregular activity stream both pour in. Several patterns are layered together to make that work.

### 1. Bounded retention, no unbounded arrays

Every metric is stored in a `RingBuffer<TimeSeriesPoint>` of fixed capacity (`MAX_SERIES_POINTS = 120`). On push, the buffer overwrites the oldest slot in place so there is no `Array.shift()` churn. A `snapshot()` rebuilds the in-order array only when a consumer asks. This bounds heap growth and keeps GC pressure flat.

The activity feed is capped at `MAX_ACTIVITY_EVENTS = 500`. Newest events ride at the front, and everything past the cap is dropped without a `splice` walk.

The heatmap state is stored as a flat key-keyed object that is mutated in place. It never reallocates a large matrix per tick.

### 2. Minimal deep reactivity

Vue's deep proxy is great until you put 120-point arrays inside it and update them every second. We avoid that.

The metrics store uses `shallowRef` for the buckets, server list, heatmap, and regions. We call `triggerRef` after each mutation so consumers re-read once, in batch, rather than thrashing through proxy traps on every entry.

The activity store uses a `shallowRef<ActivityEvent[]>` and replaces the reference whole on each merge. Events are never individually reactive.

Time-series ring buffers are non-reactive by design. Chart components read `buckets.cpu.snapshot()` inside a `computed`. If the same data shape comes back, ECharts' own diff skips redraw work.

### 3. Append-only chart updates

ECharts is initialized once per chart. When the option changes we update with `notMerge: false` and `lazyUpdate: true` so ECharts re-uses the existing series instances and applies diff-based updates. Charts also use `sampling: 'lttb'` so even if the input grows, the rendered point count stays low. This is important when zooming out across time ranges.

### 4. Throttled and rAF-batched updates

The `useResizeObserver` composable batches resize events through `requestAnimationFrame` so a viewport drag does not fire 60 resizes per second.

The activity search input is debounced at 200ms before hitting the store.

The chart shell defers a resize to the next frame after first paint to avoid a jitter on mount.

### 5. Virtualized activity feed

`useVirtualList` renders only the rows whose Y coordinate falls inside the viewport, plus an overscan buffer. Even with the full five hundred event cap, only about ten or twelve DOM nodes exist at any moment. The container relies on a single absolutely-positioned spacer for total height. Rows translate in via `transform`, which the compositor can promote without layout invalidation.

### 6. Lazy theme resolution

Chart palettes are not duplicated in every chart file. They come from CSS variables on `:root.light` and `:root.dark`. The `useChartTokens` composable reads `getComputedStyle(document.documentElement)` once on mount and once per theme change, then exposes a `ChartTokens` object to charts. This keeps the design system the single source of truth.

### 7. Page-hidden friendliness

Charts use Canvas rendering, not SVG. Canvas does no DOM work on update and is dramatically faster for 60+ visible series points. When the tab is backgrounded, browsers throttle `setInterval` automatically. The engine cooperates by running its activity timer through recursive `setTimeout`, which makes pausing trivial.

### 8. Cleanup discipline

Every interval and timeout is captured in a local variable and cleared in `onBeforeUnmount` (composables) or in the streaming service's `stop()`.

Listeners on `document.visibilitychange`, ResizeObserver, and matchMedia are torn down on unmount.

ECharts instances are explicitly disposed in `ChartShell`'s teardown.

`safeParse` deduplicates malformed-payload warnings with a four-second window so a flaky stream does not spam the console into uselessness.

## State management

Pinia is used for all cross-component state. Each store owns a single concern.

The `connection` store owns the FSM state, attempt count, latency, and last connected timestamp. It uses plain `ref` because the payload is small, reads are frequent, and fine-grained reactivity matters.

The `metrics` store owns the ring-buffered series, latest snapshot, per-server rows, heatmap cells, and region health. It uses `shallowRef` plus manual `triggerRef`, with computed trends derived from snapshots.

The `activity` store owns the bounded event log, severity and search filter, and derived counts. It uses `shallowRef`. The filter is plain reactive, and `filtered` is a memoized `computed`.

The `ui` store owns the sidebar state, time range, dataset toggles, chart visibility, and table filters. It uses plain `ref` because the surface is small. State is persisted to `localStorage` where appropriate.

There is no global event bus. Components subscribe to stores via `storeToRefs` and emit local events upward only for layout-level concerns, for example the header asking the page to toggle the stream.

## Streaming engine internals

The engine has three intentional layers because each one needs to be independently testable and replaceable.

The generator synthesizes coherent numbers. CPU drifts on a random walk anchored to the previous value with Gaussian noise. An anomaly term decays over about six ticks once injected so spikes look realistic. Per-region and per-server state are seeded so the same servers and regions persist across the session.

The transport looks like a WebSocket so you can swap it for a real one by writing a 60-line class. The `open()` method resolves after a 120 to 320ms handshake delay. The `send(payload)` method schedules delivery at a random latency between 18 and 70ms, so listeners see the payload after that delay, just like a real socket. Each tick has a `DISCONNECT_RATE` chance of spontaneous closure, modeling network instability. Each tick has a `MALFORMED_PAYLOAD_RATE` chance of having a random field stripped before delivery, exercising the Zod boundary.

The orchestrator manages timers, the reconnect FSM, and message validation. Every inbound message goes through `StreamPayloadSchema.safeParse`. On failure, the payload is dropped silently with deduplicated console warnings. Backoff uses exponential `2^attempt * 800ms` capped at 12 seconds, with plus or minus 15% jitter so simultaneous clients do not thunder. The attempt count is capped at 8. Pause and resume stop the tick timers without closing the transport. Resume re-starts ticks, or re-opens the socket if it was closed while paused.

The result is that every consumer downstream (stores, components, charts) is dealing with a stream of validated payloads. They never have to defend against missing fields.

## Validation and security

All wire payloads flow through Zod schemas (`StreamPayloadSchema`, `TelemetryPayloadSchema`, `ActivityPayloadSchema`) before reaching stores.

No `v-html` is used anywhere. All user-visible strings come from `textContent` interpolation.

No `innerHTML` is used in the codebase. Tooltips that need rich layout build DOM strings inside ECharts' tooltip formatter, which sanitizes and renders inside its own shadow tree.

No third-party data ingestion is performed. Telemetry is generated client-side. When swapping in a real WebSocket, the Zod boundary is already in place.

All `localStorage` access is wrapped in `try/catch` so private-browsing modes do not throw.

## Responsive design

The grid is a 12-column layout at `xl`, collapsing to a single column on mobile.

The sidebar collapses to icon-only at the `md` breakpoint and fully hides below `md`, replaced by a hamburger.

Charts use `autoresize` and the `useResizeObserver` composable so they re-fit on container resize.

The table is horizontally scrollable below 760px to preserve data density without breaking the layout.

Touch targets meet the 32px minimum on mobile.

## Scalability considerations

The codebase is already set up to scale in several directions.

A real WebSocket transport drops in by writing a class with the same `open / send / close / on*` shape. The file `services/streaming/index.ts` does not change at all.

Adding more dashboards is straightforward because the store layout is per-concern, not per-page. Adding a `/security` or `/regions` page only requires new components and a route entry.

Web workers are ready when needed. The file `workers/heatmap.worker.ts` is shipped as a future-proofing seam. When the heatmap fan-out grows past about 2000 cells per tick, aggregation can move off the main thread.

Plugin charts are easy because every chart is a self-contained component that consumes the metrics store. New charts add zero state and ship as a single `.vue` file.

Theming scales by definition. Adding a third theme means defining one extra `:root.themename` block in `styles.css`. Chart palettes will follow automatically.

## Trade-offs and notes

A few deliberate decisions are worth calling out.

Hash routing is used by default (`createWebHashHistory`) so the demo is trivially deployable as a static bundle without server-side rewrites. Switch to `createWebHistory` when deploying behind a SPA-aware server.

There is no SSR. Server-side rendering buys little for a streaming dashboard whose data is live anyway. The initial paint cost is dominated by the chart libs, which we lazy-fetch via `manualChunks`.

There is no Suspense for charts. Charts mount instantly, and skeletons cover the brief window before the first telemetry tick arrives. Suspense added latency without UX benefit.

The transport is mock-only. A real backend was out of scope. The mock transport is structured to be a drop-in replacement.

LTTB sampling is used in place of exact lines. ECharts' LTTB sampling produces visually identical line traces at a fraction of the draw cost. At our retention size of 120 points it is essentially a no-op, but it pays off if we extend the window.

## Future improvements

Persist time range, dataset toggles, and table filters to the URL query string so dashboard views are shareable.

Add a real WebSocket transport behind a feature flag, validated against the same Zod schemas.

Offload anomaly detection (rolling z-score) to a Web Worker and surface anomaly markers as ECharts `markLine`s.

Add per-chart export (PNG, CSV).

Add a keyboard command palette (Cmd+K) with quick jumps to regions, servers, and saved views.

Add multi-tenant theming via runtime token overrides.

Add E2E tests with Playwright for the streaming lifecycle and reconnect FSM.

## License

MIT.
