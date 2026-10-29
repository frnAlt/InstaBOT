"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deferred = void 0;
class Deferred extends Promise {
  constructor(initialValue) {
    let res;
    let rej;
    super((res_cb, rej_cb) => {
      res = res_cb;
      rej = rej_cb;
    });
    this.resolve = (value) => {
      if (this.status !== "pending") return;
      this.value = value;
      this.status = "fulfilled";
      res(value);
    };
    this.reject = (reason) => {
      if (this.status !== "pending") return;
      this.rejectReason = reason;
      this.status = "rejected";
      rej(reason);
    };
    this.value = initialValue ?? null;
    this.status = "pending";
  }
}
exports.Deferred = Deferred;
