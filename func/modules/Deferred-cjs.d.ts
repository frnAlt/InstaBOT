export declare class Deferred<Res, Rej = unknown> extends Promise<Res> {
  constructor(initialValue?: Res);
  status: "pending" | "fulfilled" | "rejected";
  value: Res | null;
  rejectReason?: Rej | null;
  resolve: (value: Res) => void;
  reject: (reason?: Rej) => void;
}
