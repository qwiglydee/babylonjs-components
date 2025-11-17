/* Promise.withResolvers from ES2024 */
export class Deferred<T = any> {
    promise!: Promise<T>;
    resolve!: (value: T) => void;
    reject!: (error: Error) => void;

    constructor() {
        this.promise = new Promise<T>((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
