"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pinger = void 0;
/**
 * This class is stupid, do not use.
 */
class Pinger {
    startTime = null;
    endTime = null;
    records = [];
    constructor(config) {
        this.startTime = config?.startTime ?? null;
        this.endTime = config?.endTime ?? null;
        this.records = config?.records ?? null;
    }
    /**
     * Start the timer
     */
    start() {
        this.startTime = performance.now();
        this.endTime = null;
    }
    /**
     * Stop the timer and calculate the elapsed
     */
    stop() {
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
    getLastPing() {
        return this.records.length > 0
            ? this.records[this.records.length - 1]
            : null;
    }
    /**
     * Get all recorded time differences
     */
    getRecords() {
        return [...this.records];
    }
    /**
     * Reset the timer and records
     */
    reset() {
        this.startTime = null;
        this.endTime = null;
        this.records = [];
    }
    /**
     * Record a ping with a hook
     */
    recordPing() {
        const elapsed = this.stop();
        if (elapsed !== null && this.onPingRecorded) {
            this.onPingRecorded(elapsed);
        }
    }
}
exports.Pinger = Pinger;
