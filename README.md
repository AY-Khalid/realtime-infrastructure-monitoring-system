# Pulse — Real-Time Infrastructure Dashboard

A production-grade real-time data visualization platform that simulates a live infrastructure monitoring console. Built with **Vue 3 + TypeScript + Vite**, it streams synthetic telemetry continuously and renders it through a tightly-engineered pipeline of bounded buffers, throttled reactivity, and Canvas-rendered ECharts.

The look and feel target the same design vocabulary you'd find in Datadog, Grafana, Vercel Analytics, and Linear: a quiet, command-center aesthetic with subtle motion, dark-first theming, and dense but readable information layout.

---

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

---

## What it does

The dashboard simulates a live telemetry stream from a global fleet of servers across seven regions. Every second a new telemetry frame arrives carrying a CPU/memory/network/error snapshot, per-server breakdowns, a regional heatmap, and per-region health scores. Activity events (CPU spikes, recoveries, suspicious traffic, deploys) arrive on an irregular cadence.

The UI surfaces this through:

- **Six animated KPI cards** with sparklines, trend deltas, and live-tweened counters.
- **Five charts** powered by ECharts on Canvas: a composite CPU/Memory/Errors line chart with secondary axis for requests, a gradient memory area chart, a stacked inbound/outbound network bar chart, a regional load heatmap, and a six-dimension regional radar.
- **A virtualised live activity feed** with severity badges, debounced search, and severity filtering. Memory is hard-capped at 500 events.
- **A TanStack-powered fleet table** with sorting, filtering, pagination, sticky headers, and per-cell utilization bars.
- **A reconnect banner** that surfaces connection state transitions (`connecting → connected → reconnecting → disconnected`).
- **Theme toggle** (light / dark) driven entirely by CSS custom properties so charts re-resolve their palette on theme change.
- **Stream controls** to pause/resume the simulation and to deliberately trigger a disconnect for testing reconnect behaviour.

---

## Architecture

```
src/
├── app/               # bootstrapping: providers, router, layouts, theme registry
├── components/        # presentational + container components, grouped by feature
│   ├── charts/        # ECharts chart components (each is option-only, no state)
│   ├── cards/         # KPI cards + grid
│   ├── controls/      # time range, dataset toggles, stream control, theme
│   ├── feed/          # activity feed + filters + virtualised rows
│   ├── table/         # TanStack table + filters + cell renderers
│   ├── ui/            # design-system primitives (Card, Button, Badge, etc.)
│   └── layout/        # AppHeader, AppSidebar
├── composables/       # Vue composables — single-purpose, reusable
├── services/
│   ├── streaming/     # streaming engine — orchestrates everything
│   ├── websocket/     # transport (currently mocked, websocket-shaped)
│   └── mock/          # telemetry & activity generators
├── stores/            # Pinia stores (connection, metrics, activity, ui)
├── types/             # all TS types + Zod schemas
├── utils/             # ring buffer, throttle, formatters, safe parse, etc.
├── constants/         # app, streaming, regions, time ranges, activity, chart tokens
├── data/              # seed inventory (server IDs, heatmap shape)
├── workers/           # optional aggregation worker (future-proofing seam)
├── pages/             # route-level views (Dashboard)
└── assets/            # CSS tokens + design-system base styles
```

### Layered separation of concerns

1. **Transport (`services/websocket`).** A `MockTransport` mimics a real WebSocket — `open()`, `send()`, `close()`, `onMessage`, `onClose`, `onLatency`. It models latency, jitter, sporadic disconnects, and occasionally corrupts payloads so the validation layer is actually exercised.
2. **Generator (`services/mock`).** `TelemetryGenerator` is a stateful simulator that runs coherent random walks per metric, injects anomaly bursts, and emits per-server / per-region breakdowns. It is fully encapsulated; consumers only ever see `TelemetryPayload` and `ActivityPayload` objects.
3. **Streaming engine (`services/streaming`).** The single orchestration point. Owns the simulation timers, the transport, and the connection finite-state-machine. Validates every inbound payload through Zod before fan-out. Exposes a tiny public API (`start`, `stop`, `pause`, `resume`, `onPayload`, `onState`) so it can be replaced by a real WebSocket transport without touching consumers.
4. **Stores (`stores/`).** Pinia stores are the *single source of truth* for the UI. `metrics` holds the ring-buffered time-series and latest snapshot. `activity` holds the bounded event log and filter state. `connection` holds the FSM state. `ui` holds purely client-side preferences (time range, dataset toggles, sidebar state).
5. **Composables (`composables/`).** Reusable behaviour: `useStreaming` wires the engine to the stores, `useChartTokens` exposes the live theme tokens to chart options, `useAnimatedNumber` tweens KPI values, `useVirtualList` powers the feed, `useTheme` manages dark/light mode persistence, and so on.
6. **Components (`components/`).** Components consume stores via `storeToRefs` and composables. They are intentionally thin — they own *presentation* and *user input*, never business state.

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

Reconnect uses base-800ms exponential backoff, jittered ±15%, capped at 12s and 8 attempts. Each attempt is published to the connection store so the banner can show the live countdown.

---

## Rendering & performance strategy

This is the part of the codebase that mattered most. The dashboard must remain smooth indefinitely while a 1 Hz telemetry stream and an irregular activity stream both pour in. Several patterns are layered together to make that work:

### 1. Bounded retention, no unbounded arrays

- **Time-series.** Every metric is stored in a `RingBuffer<TimeSeriesPoint>` of fixed capacity (`MAX_SERIES_POINTS = 120`). On `push`, the buffer overwrites the oldest slot in place — no `Array.shift()` churn. A `snapshot()` rebuilds the in-order array only when a consumer asks. This bounds heap growth and keeps GC pressure flat.
- **Activity feed.** Capped at `MAX_ACTIVITY_EVENTS = 500`. Newest events ride at the front; everything past the cap is dropped without a `Array.prototype.splice` walk.
- **Heatmap state.** Stored as a flat key-keyed object, mutated in place; never reallocates a giant matrix per tick.

### 2. Minimal deep reactivity

Vue's deep proxy is great until you put 120-point arrays inside it and update them every second. We avoid that:

- The metrics store uses **`shallowRef`** for the buckets, server list, heatmap, and regions. We call **`triggerRef`** after each mutation so consumers re-read once, in batch, rather than thrashing through proxy traps on every entry.
- The activity store uses a `shallowRef<ActivityEvent[]>` and replaces the reference whole on each merge; events are never individually reactive.
- Time-series ring buffers are **non-reactive** by design. Chart components read `buckets.cpu.snapshot()` inside a `computed`; if the same data shape comes back, ECharts' own diff skips redraw work.

### 3. Append-only chart updates

ECharts is initialised once per chart. When the option changes we update with `notMerge: false` and `lazyUpdate: true` so ECharts re-uses the existing series instances and applies diff-based updates. Charts also use **`sampling: 'lttb'`** so even if the input grows, the rendered point count stays low — important when zooming out across time ranges.

### 4. Throttled and rAF-batched updates

- The `useResizeObserver` composable batches resize events through `requestAnimationFrame` so a viewport drag doesn't fire 60 resizes per second.
- The activity search input is debounced (200ms) before hitting the store.
- The chart shell defers a resize to the next frame after first paint to avoid a jitter on mount.

### 5. Virtualised activity feed

`useVirtualList` renders only the rows whose `y` falls inside the viewport (plus an overscan buffer). Even with the full 500-event cap, only ~10-12 DOM nodes exist at any moment. The container relies on a single absolutely-positioned spacer for total height; rows translate in via `transform`, which the compositor can promote without layout invalidation.

### 6. Lazy theme resolution

Chart palettes are not duplicated in every chart file. They come from CSS variables on `:root.light` / `:root.dark`. The `useChartTokens` composable reads `getComputedStyle(document.documentElement)` once on mount and once per theme change, then exposes a `ChartTokens` object to charts. This keeps the design system the single source of truth.

### 7. Page-hidden friendliness

Charts use Canvas rendering (not SVG) — Canvas does no DOM work on update and is dramatically faster for 60+ visible series points. When the tab is backgrounded, browsers throttle `setInterval` automatically; the engine cooperates by running its activity timer through `setTimeout` recursion, which makes pausing trivial.

### 8. Cleanup discipline

- Every interval/timeout is captured in a local variable and cleared in `onBeforeUnmount` (composables) or in the streaming service's `stop()`.
- Listeners on `document.visibilitychange`, ResizeObserver, and matchMedia are torn down on unmount.
- ECharts instances are explicitly `dispose()`-ed in `ChartShell`'s teardown.
- `safeParse` deduplicates malformed-payload warnings with a 4-second window so a flaky stream doesn't spam the console into uselessness.

---

## State management

Pinia is used for all cross-component state. Each store owns a single concern:

| Store | Owns | Reactivity strategy |
|-------|------|---------------------|
| `connection` | FSM state, attempt count, latency, last connected timestamp | Plain `ref` — small payload, frequent reads, fine-grained reactivity matters |
| `metrics` | Ring-buffered series, latest snapshot, per-server rows, heatmap cells, region health | `shallowRef` + manual `triggerRef`; computed trends derived |
| `activity` | Bounded event log, severity/search filter, derived counts | `shallowRef`; filter is plain reactive; `filtered` is a memoised `computed` |
| `ui` | Sidebar state, time range, dataset toggles, chart visibility, table filters | Plain `ref` — small surface, persisted to `localStorage` where appropriate |

There is **no global event bus** — components subscribe to stores via `storeToRefs` and emit local events upward only for layout-level concerns (e.g. the header asking the page to toggle the stream).

---

## Streaming engine internals

The engine has three intentional layers because each one needs to be independently testable and replaceable:

1. **Generator.** Synthesises *coherent* numbers. CPU drifts on a random walk anchored to the previous value with Gaussian noise; an anomaly term decays over ~6 ticks once injected so spikes look realistic. Per-region and per-server state are seeded so the same servers/regions persist across the session.

2. **Transport.** Looks like a WebSocket so you can swap it for a real one by writing a 60-line class. Key behaviours:
   - `open()` resolves after a 120-320ms handshake delay.
   - `send(payload)` schedules delivery at a random latency between 18-70ms — listeners see the payload *after* that delay, just like a real socket.
   - Each tick has a `DISCONNECT_RATE` chance of spontaneous closure, modelling network instability.
   - Each tick has a `MALFORMED_PAYLOAD_RATE` chance of having a random field stripped before delivery, exercising the Zod boundary.

3. **Orchestrator.** Manages timers, the reconnect FSM, and message validation:
   - **Validation:** every inbound message goes through `StreamPayloadSchema.safeParse`. On failure, the payload is dropped silently (with deduplicated console warnings).
   - **Backoff:** exponential `2^attempt × 800ms` capped at 12s, with ±15% jitter so simultaneous clients don't thunder. Capped at 8 attempts.
   - **Pause/resume:** stops the tick timers without closing the transport. Resume re-starts ticks (or re-opens the socket if it was closed while paused).

The result is that every consumer downstream — stores, components, charts — is dealing with a stream of *validated* payloads. They never have to defend against missing fields.

---

## Validation and security

- **All wire payloads** flow through Zod schemas (`StreamPayloadSchema`, `TelemetryPayloadSchema`, `ActivityPayloadSchema`) before reaching stores.
- **No `v-html`** is used anywhere. All user-visible strings come from `textContent` interpolation.
- **No `innerHTML`** in the codebase. Tooltips that need rich layout build DOM strings inside ECharts' tooltip formatter, which sanitises and renders inside its own shadow tree.
- **No third-party data ingestion** — telemetry is generated client-side. When swapping in a real WebSocket, the Zod boundary is already in place.
- **`localStorage` access** is wrapped in try/catch so private-browsing modes don't throw.

---

## Responsive design

- The grid is a 12-column layout at `xl`, collapsing to a single column on mobile.
- The sidebar collapses to icon-only at the `md` breakpoint and fully hides below `md` (replaced by a hamburger).
- Charts use `autoresize` and the `useResizeObserver` composable so they re-fit on container resize.
- The table is horizontally scrollable below 760px to preserve the data density without breaking the layout.
- Touch targets meet the 32px minimum on mobile.

---

## Scalability considerations

What this codebase is already set up to scale into:

- **Real WebSocket transport.** Drop in a class with the same `open / send / close / on*` shape and `services/streaming/index.ts` doesn't change at all.
- **Multiple dashboards.** The store layout is per-concern, not per-page. Adding a `/security` or `/regions` page only requires new components and a route entry.
- **Web workers.** `workers/heatmap.worker.ts` is shipped as a future-proofing seam. When the heatmap fan-out grows past ~2k cells per tick we can move aggregation off the main thread.
- **Plugin charts.** Every chart is a self-contained component that consumes the metrics store. New charts add zero state and ship as a single `.vue` file.
- **Theming.** Adding a third theme means defining one extra `:root.themename` block in `styles.css`; chart palettes will follow automatically.

---

## Trade-offs and notes

A few deliberate decisions worth calling out:

- **Hash routing.** We use `createWebHashHistory` so the demo is trivially deployable as a static bundle without server-side rewrites. Switch to `createWebHistory` when deploying behind a SPA-aware server.
- **No SSR.** Server-side rendering buys little for a streaming dashboard whose data is live anyway. The initial paint cost is dominated by the chart libs, which we lazy-fetch via `manualChunks`.
- **No Suspense for charts.** Charts mount instantly; skeletons cover the brief window before the first telemetry tick arrives. Suspense added latency without UX benefit.
- **Mock-only transport.** A real backend was out of scope; the mock transport is structured to be a drop-in replacement.
- **`lttb` sampling vs. exact lines.** ECharts' LTTB sampling produces visually-identical line traces at a fraction of the draw cost. At our retention size (120 points) it's a no-op, but it pays off if we extend the window.

---

## Future improvements

- Persist time range, dataset toggles, and table filters to the URL query string so dashboard views are shareable.
- Add a real WebSocket transport behind a feature flag, validated against the same Zod schemas.
- Offload anomaly detection (rolling z-score) to a Web Worker and surface anomaly markers as ECharts `markLine`s.
- Per-chart export (PNG / CSV).
- Keyboard command palette (Cmd+K) with quick jumps to regions, servers, and saved views.
- Multi-tenant theming via runtime token overrides.
- E2E tests with Playwright for the streaming lifecycle and reconnect FSM.

---

## License

MIT.
