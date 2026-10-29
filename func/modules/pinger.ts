/**
 * This class is stupid, do not use.
 */
export class Pinger {
  public startTime: number | null = null;
  public endTime: number | null = null;
  public records: number[] = [];

  constructor(config?: Partial<Pinger>) {
    this.startTime = config?.startTime ?? null;
    this.endTime = config?.endTime ?? null;
    this.records = config?.records ?? null;
  }

  /**
   * Start the timer
   */
  start(): void {
    this.startTime = performance.now();
    this.endTime = null;
  }

  /**
   * Stop the timer and calculate the elapsed
   */
  stop(): number | null {
    if (this.startTime === null) {
      throw new Error("Pinger has not been started.");
    }
    this.endTime = performance.now();
    const elapsed = this.endTime - this.startTime;
    this.records.push(elapsed);
    return elapsed;
  }

  /**
   * Get the last recorded time difference
   */
  getLastPing(): number | null {
    return this.records.length > 0
      ? this.records[this.records.length - 1]
      : null;
  }

  /**
   * Get all recorded time differences
   */
  getRecords(): number[] {
    return [...this.records];
  }

  /**
   * Reset the timer and records
   */
  reset(): void {
    this.startTime = null;
    this.endTime = null;
    this.records = [];
  }

  /**
   * Hook for custom behavior after a ping is recorded
   */
  onPingRecorded?(elapsed: number): void;

  /**
   * Record a ping with a hook
   */
  recordPing(): void {
    const elapsed = this.stop();
    if (elapsed !== null && this.onPingRecorded) {
      this.onPingRecorded(elapsed);
    }
  }
}
