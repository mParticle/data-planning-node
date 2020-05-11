import { AxiosPromise } from 'axios';
import { Token } from '../utils/AuthClient';
export declare class ApiClient<T> {
    rootUrl: string;
    token?: Token | undefined;
    constructor(rootUrl: string, token?: Token | undefined);
    private addTokens;
    fetch(): AxiosPromise;
    post(body: {
        [key: string]: any;
    }): AxiosPromise;
    patch(body: {
        [key: string]: any;
    }): AxiosPromise;
    delete(): AxiosPromise;
}
