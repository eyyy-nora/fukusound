import { isMainThread, parentPort, Worker as W } from "node:worker_threads";
import { ExitError } from "src/worker/lib/error";
import {
  isWorkerMessage,
  WorkerEvent as WE,
  WorkerMessage,
} from "src/worker/lib/message";
import { getWorkerMeta } from "src/worker/lib/meta";
import { ProgressPromise } from "src/worker/lib/progress-promise";

export function Worker(path: string) {
  return function (cls: any) {
    if (isMainThread) {
      return class extends cls {
        constructor(...params: any[]) {
          super(...params);
          const meta = getWorkerMeta(cls);
          meta.instance = this;
          const w = (meta.worker = new W(path));
          // instantiate worker class
          w.postMessage({ type: WE.Init, params });
        }
      } as any;
    } else {
      parentPort.on("message", function onMessage(msg: any) {
        if (!isWorkerMessage(msg, WE.Init)) return;
        parentPort.off("message", onMessage);
        const meta = getWorkerMeta(cls);
        const instance = (meta.instance = new cls(...msg.params));
        meta.initialising = Promise.all(
          meta.init.map(handler => {
            return Promise.resolve(instance[handler].call(instance));
          }),
        ).then();
      });
    }
  };
}

Worker.Init = function () {
  return (proto: any, method: string) => {
    getWorkerMeta(proto.constructor).init.push(method);
  };
};

Worker.Method = function () {
  return (proto: any, method: string, desc: any) => {
    const meta = getWorkerMeta(proto.constructor);
    const orig = desc.value;
    meta.forwarded.push(method);

    if (isMainThread) {
      desc.value = function (this: any, ...params: any[]) {
        const id = `${method}-${Date.now()}-${Math.random()}`;
        const w = meta.worker!;
        return new ProgressPromise((resolve, reject, progress) => {
          w.postMessage({ type: WE.Call, method, id, params });
          function unregister() {
            w.off("message", onMessage);
            w.off("exit", onExit);
          }

          function onMessage(msg: any) {
            if (!isWorkerMessage(msg, WE.Error, WE.Progress, WE.Report)) return;
            if (msg.id !== id) return;
            if (msg.type === WE.Progress) progress(msg.stage, msg.progress);
            else if (msg.type === WE.Report) resolve(msg.result);
            else if (msg.type === WE.Error) reject(msg.error);
            else return;
            unregister();
          }

          function onExit(code) {
            reject(new ExitError(code));
            unregister();
          }

          w.on("message", onMessage);
          w.on("exit", onExit);
        });
      };
    } else {
      parentPort.on("message", msg => {
        if (!isWorkerMessage(msg, WE.Call)) return;
        const { id, method, params } = msg;

        function post(msg: WorkerMessage) {
          parentPort.postMessage({ id, method, ...msg });
        }

        ProgressPromise.resolve(meta.initialising)
          .then(() => orig.call(meta.instance, ...params))
          .on("progress", (stage, progress) =>
            post({
              type: WE.Progress,
              stage,
              progress,
            }),
          )
          .then(result => post({ type: WE.Report, result }))
          .catch(error => post({ type: WE.Error, error }));
      });
    }
  };
};
