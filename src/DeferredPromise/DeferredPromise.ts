export default class DeferredPromise<T> implements Promise<T> {
  private _promise: Promise<T>;
  resolve!: (t?: T) => void;
  reject!: (error?: any) => void;

  finally: (onfinally?: (() => void) | undefined | null) => Promise<T>;
  then: <TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) => Promise<TResult1 | TResult2>;
  catch: <TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ) => Promise<T | TResult>;

  state: 'pending' | 'fulfilled' | 'rejected';

  constructor() {
    this.state = 'pending';
    this._promise = new Promise((resolve, reject) => {
      this.resolve = (value?: T | PromiseLike<T> | undefined) => {
        this.state = 'fulfilled';
        resolve(value);
      };
      this.reject = (reason: any) => {
        this.state = 'rejected';
        reject(reason);
      };
    });

    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this.finally = this._promise.finally.bind(this._promise);
  }

  [Symbol.toStringTag] = 'Promise' as 'Promise';
}
