import type { Worker } from "node:worker_threads";

const META = Symbol("worker-meta");
export interface WorkerMeta {
  instance?: any;
  worker?: Worker;
  init: string[];
  initialising?: Promise<void>;
  forwarded: string[];
  message: string[];
  error: string[];
  exit: string[];
}

export function getWorkerMeta(cls: any): WorkerMeta {
  return (cls[META] ??= {
    init: [],
    forwarded: [],
    message: [],
    error: [],
    exit: [],
  });
}
