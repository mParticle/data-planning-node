import deepmerge from 'deepmerge';

// tslint:disable-next-line: max-line-length
// https://medium.com/better-programming/stop-filling-your-tests-with-test-data-4eaa151bfe31
// Props to Jaime Morris for this inspiration

export class TestDataFactory<T> {
    // tslint:disable-next-line: no-any
    [x: string]: any;
    constructor(private generatorFn: () => T) {}

    // tslint:disable-next-line: no-any
    getOne(override: any = {}): T {
        return deepmerge(this.generatorFn(), override);
    }

    // tslint:disable-next-line: no-any
    getArray(length = 20, overrides: any[] = []): T[] {
        return Array.from(new Array(length)).map((_, i) =>
            this.getOne(overrides[i])
        );
    }
}
