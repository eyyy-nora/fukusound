import { Worker, parentPort, isMainThread } from "node:worker_threads";

const META = Symbol("worker");

export function WorkerThread(path: string): ClassDecorator {
  return function (cls) {
    if (isMainThread) {
      return class extends (cls as any) {
        constructor() {
          super();
          initWorker(cls, this, path);
        }
      };
    } else {
      const obj = new (cls as any)();
      const meta = workerMeta(cls);
      meta.instance = obj;
      meta.initialised = Promise.all(
        meta.init.map(handler => Promise.resolve(obj[handler].call(obj))),
      ).then();
      for (const handler of meta.init) obj[handler].call(obj);
    }
  } as any;
}

WorkerThread.Init = function (proto: any, key: string) {
  workerMeta(proto.constructor).init.push(key);
};

WorkerThread.Forward = function (proto: any, key: string, desc: any) {
  workerMeta(proto.constructor).forward.push(key);
  const orig = desc.value;
  if (isMainThread) {
    desc.value = function (this: any, ...params: any[]) {
      const w = workerMeta(proto.constructor, this).worker!;
      const id = Date.now() + "-" + Math.random();
      w.postMessage({
        type: "FORWARD_WORKER_METHOD_CALL",
        method: key,
        id,
        params,
      });
      return new Promise((resolve, reject) => {
        function unregister() {
          w.off("message", onMessage);
          w.off("exit", onExit);
        }
        function onMessage(msg: any) {
          console.log("message", msg);
          if (typeof msg !== "object" || !msg) return;
          if (msg.type !== "FORWARD_WORKER_METHOD_RESULT") return;
          if (msg.id !== id) return;
          if ("error" in msg) reject(msg.error);
          else resolve(msg.result);
          unregister();
        }
        function onExit(code: number) {
          reject(new ExitError(code));
          unregister();
        }

        w.on("message", onMessage);
        w.on("exit", onExit);
      });
    };
  } else {
    parentPort.on("message", msg => {
      console.log("child message", msg);
      if (typeof msg !== "object" || !msg) return;
      if (msg.type !== "FORWARD_WORKER_METHOD_CALL") return;
      const { method, id, params } = msg;
      function post(result: any, error = false) {
        parentPort.postMessage({
          type: "FORWARD_WORKER_METHOD_RESULT",
          method,
          id,
          params,
          [error ? "error" : "result"]: result,
        });
      }
      const meta = workerMeta(proto.constructor);
      const cxt = meta.instance;
      Promise.resolve(meta.initialised)
        .then(() => orig.call(cxt, ...params))
        .then(result => post(result))
        .catch(error => post(error, true));
    });
  }
};

class ExitError extends Error {
  constructor(public code: number) {
    super(`Process exited with code ${code}`);
  }
}

interface WorkerMeta {
  worker?: Worker;
  init: string[];
  forward: string[];
  message: Record<string, string[]>;
  error: string[];
  exit: string[];
  instance?: any;
  initialised?: Promise<void>;
}

function workerMeta(cls: any, instance?: any, worker?: Worker): WorkerMeta {
  const meta = (cls[META] ??= {
    init: [],
    forward: [],
    message: {},
    error: [],
    exit: [],
  });
  if (instance) return { ...meta, worker: (instance[META] ??= worker) };
  else return meta;
}

function initWorker(cls: any, instance: any, path: string) {
  workerMeta(cls, instance, new Worker(path));
}
