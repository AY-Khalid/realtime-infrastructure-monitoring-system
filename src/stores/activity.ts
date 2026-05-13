import { defineStore } from 'pinia';
import { computed, ref, shallowRef, triggerRef } from 'vue';
import { MAX_ACTIVITY_EVENTS } from '@/constants/streaming';
import { SEVERITY_ORDER } from '@/constants/activity';
import type { ActivityEvent, ActivityFilter, Severity } from '@/types';

/**
 * Activity store.
 *
 * Stores events in a *non-reactive* array wrapped in a shallow ref. Newest
 * first. We cap retention strictly so memory never grows unbounded under
 * sustained streaming.
 *
 * Filter state is plain reactive; filtering is a `computed` that recalculates
 * only when filter/search change or new events arrive — and even then the
 * filtered list is O(n) over a hard-bounded n.
 */
export const useActivityStore = defineStore('activity', () => {
  const events = shallowRef<ActivityEvent[]>([]);
  const filter = ref<ActivityFilter>({
    severities: ['info', 'warning', 'critical'],
    search: '',
  });

  function appendEvents(incoming: ActivityEvent[]): void {
    if (incoming.length === 0) return;
    // Newest events ride at the front; cap retention.
    const next = events.value;
    const merged = new Array<ActivityEvent>(Math.min(MAX_ACTIVITY_EVENTS, next.length + incoming.length));
    let i = 0;
    for (let k = incoming.length - 1; k >= 0 && i < merged.length; k -= 1) {
      merged[i++] = incoming[k];
    }
    for (let k = 0; k < next.length && i < merged.length; k += 1) {
      merged[i++] = next[k];
    }
    events.value = merged;
    triggerRef(events);
  }

  function clear(): void {
    events.value = [];
    triggerRef(events);
  }

  function setSearch(q: string): void {
    filter.value = { ...filter.value, search: q };
  }

  function toggleSeverity(sev: Severity): void {
    const set = new Set(filter.value.severities);
    if (set.has(sev)) set.delete(sev);
    else set.add(sev);
    filter.value = { ...filter.value, severities: [...set] };
  }

  function setSeverities(severities: Severity[]): void {
    filter.value = { ...filter.value, severities };
  }

  const filtered = computed<ActivityEvent[]>(() => {
    const f = filter.value;
    const q = f.search.trim().toLowerCase();
    const sevSet = new Set(f.severities);
    const all = events.value;
    if (sevSet.size === 3 && q === '') return all;
    const out: ActivityEvent[] = [];
    for (let i = 0; i < all.length; i += 1) {
      const e = all[i];
      if (!sevSet.has(e.severity)) continue;
      if (q) {
        const hay =
          e.title.toLowerCase() +
          ' ' +
          (e.detail ?? '').toLowerCase() +
          ' ' +
          (e.region ?? '') +
          ' ' +
          (e.serverId ?? '');
        if (hay.indexOf(q) === -1) continue;
      }
      out.push(e);
    }
    return out;
  });

  const counts = computed(() => {
    const out: Record<Severity, number> = { critical: 0, warning: 0, info: 0 };
    for (const e of events.value) out[e.severity] += 1;
    return out;
  });

  const severityOrder = SEVERITY_ORDER;

  return {
    events,
    filter,
    filtered,
    counts,
    severityOrder,
    appendEvents,
    clear,
    setSearch,
    toggleSeverity,
    setSeverities,
  };
});
