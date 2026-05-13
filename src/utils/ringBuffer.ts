/**
 * Bounded ring buffer specialised for time-series. Avoids array shift() on
 * every push by overwriting the oldest slot in place. We expose `snapshot()`
 * that returns a fresh array in insertion order so consumers (ECharts) get
 * a normal `T[]`. Snapshot cost is O(n) but only invoked when something
 * actually needs to render.
 */
export class RingBuffer<T> {
  private buf: T[];
  private head = 0;
  private _size = 0;

  constructor(public readonly capacity: number) {
    this.buf = new Array<T>(capacity);
  }

  push(value: T): void {
    if (this._size < this.capacity) {
      this.buf[(this.head + this._size) % this.capacity] = value;
      this._size += 1;
    } else {
      this.buf[this.head] = value;
      this.head = (this.head + 1) % this.capacity;
    }
  }

  get size(): number {
    return this._size;
  }

  /** Returns the contents in insertion order. */
  snapshot(): T[] {
    const out = new Array<T>(this._size);
    for (let i = 0; i < this._size; i += 1) {
      out[i] = this.buf[(this.head + i) % this.capacity];
    }
    return out;
  }

  last(): T | undefined {
    if (this._size === 0) return undefined;
    return this.buf[(this.head + this._size - 1) % this.capacity];
  }

  first(): T | undefined {
    if (this._size === 0) return undefined;
    return this.buf[this.head];
  }

  clear(): void {
    this.head = 0;
    this._size = 0;
  }
}
