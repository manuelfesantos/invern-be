/**
 * Fake of the Honeycomb tracer (`Logger`) passed into `withLogger`.
 *
 * `buildLoggerInstance` only calls `addData(...)` and `log(...)` on the tracer
 * (it attaches info/debug/warn/error/addRedactedData itself), so those are the
 * only members the fake needs. Calls are captured so tests can assert on what
 * was logged / added to the trace.
 */

export class FakeLogger {
  public readonly data: unknown[] = [];
  public readonly logs: string[] = [];

  addData(...args: unknown[]): void {
    this.data.push(...args);
  }

  log(message: string): void {
    this.logs.push(message);
  }
}

// The real `Logger` type is Honeycomb's tracer; the store only uses add/log.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeFakeLogger = (): any => new FakeLogger();
