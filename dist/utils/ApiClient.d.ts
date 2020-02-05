import { AxiosPromise } from 'axios';
import { Token } from '../utils/AuthClient';
export declare class ApiClient<T> {
    rootUrl: string;
    token?: Token | undefined;
    constructor(rootUrl: string, token?: Token | undefined);
    fetch(): AxiosPromise;
    post(body: {
        [key: string]: any;
    }): AxiosPromise;
}
