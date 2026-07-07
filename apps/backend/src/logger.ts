/**
 * Minimal Workers-native logger implementing the surface the logger store uses
 * (`addData` + `log`). Replaces the Honeycomb Pages plugin's tracer; a richer
 * observability sink (Workers Logpush / OTEL) comes later.
 */
/* eslint-disable no-console */
export class WorkerLogger {
  addData(...args: unknown[]): void {
    // Structured trace attributes; console for the spike.
    if (args.length)
      console.log(JSON.stringify({ level: "trace", data: args }));
  }

  log(message: string): void {
    console.log(message);
  }
}
