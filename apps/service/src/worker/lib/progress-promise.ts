type ProgressHandler<Stage extends string> = (
  stage: Stage,
  progress: number,
) => void;
type ProgressExecutor<T, Stage extends string> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
  progress: (stage: Stage, progress: number) => void,
) => void;

export class ProgressPromise<T, Stage extends string> extends Promise<T> {
  handlers: ProgressHandler<Stage>[] = [];
  stage?: Stage;
  progress: number = 0;

  constructor(
    executor: ProgressExecutor<T, Stage>,
    update?: ProgressHandler<Stage>,
    stage?: Stage,
  ) {
    super((resolve, reject) => {
      executor(resolve, reject, (stage, progress) => {
        if (update) update(stage, progress);
        this.stage = stage;
        this.progress = progress;
        for (const handler of this.handlers) handler(stage, progress);
      });
    });
    this.stage = stage;
  }

  on(event: "progress", handler: ProgressHandler<Stage>) {
    if (event !== "progress")
      throw new RangeError("only progress event is supported");
    this.handlers.push(handler);
    return this;
  }

  off(event: "progress", handler: ProgressHandler<Stage>) {
    if (event !== "progress")
      throw new RangeError("only progress event is supported");
    const index = this.handlers.lastIndexOf(handler);
    if (index !== -1) this.handlers.splice(index, 1);
    return this;
  }

  static resolve<T, Stages extends string = string>(
    value?: T | Promise<T> | ProgressPromise<T, Stages>,
  ): ProgressPromise<T, Stages> {
    if (typeof value !== "object" || !value)
      return new this(resolve => resolve(value)) as any;
    if ("then" in value && "catch" in value)
      return new this((resolve, reject, progress) => {
        if ("on" in value) value.on("progress", progress as any);
        value.then(resolve).catch(reject);
      }) as any;
    return new this(resolve => resolve(value)) as any;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => PromiseLike<TResult1> | TResult1)
      | undefined
      | null,
    onrejected?:
      | ((reason: any) => PromiseLike<TResult2> | TResult2)
      | undefined
      | null,
  ): ProgressPromise<TResult1 | TResult2, Stage> {
    return ProgressPromise.resolve(super.then(onfulfilled, onrejected));
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => PromiseLike<TResult> | TResult)
      | undefined
      | null,
  ): ProgressPromise<T | TResult, Stage> {
    return ProgressPromise.resolve(super.catch(onrejected));
  }

  finally(
    onfinally?: (() => void) | undefined | null,
  ): ProgressPromise<T, Stage> {
    return ProgressPromise.resolve(super.finally(onfinally));
  }
}
