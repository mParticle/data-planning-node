import axios, { AxiosPromise } from 'axios';
import { Token, TokenAPIResponse } from '../utils/AuthClient';

export class ApiClient<T> {
    constructor(public rootUrl: string, public token?: Token) {}

    fetch(): AxiosPromise {
        const headers: { [key: string]: string } = {};

        if (this.token) {
            if (this.token.type.toUpperCase() === 'BEARER') {
                headers[
                    'Authorization'
                ] = `${this.token.type} ${this.token.value}`;
            } else {
                console.error('Received non-Bearer Token', this.token);
                throw new Error('Invalid Auth token type');
            }
        }

        return axios.get(`${this.rootUrl}`, {
            headers,
        });
    }

    // tslint:disable-next-line: no-any
    post(body: { [key: string]: any }): AxiosPromise {
        return axios.post(`${this.rootUrl}`, body);
    }
}
