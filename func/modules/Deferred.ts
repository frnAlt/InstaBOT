export class Deferred<Res, Rej = unknown> extends Promise<Res> {
  constructor(initialValue?: Res) {
    let res: Deferred<Res>["resolve"];
    let rej: Deferred<Res>["reject"];
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

  status: "pending" | "fulfilled" | "rejected";

  value: Res | null;

  rejectReason?: Rej | null;

  resolve: (value: Res) => void;
  reject: (reason?: Rej) => void;
}
