import axios, { AxiosPromise } from 'axios';
import { Token } from '../utils/AuthClient';

interface HTTPHeader {
    Authorization?: string;
}

export class ApiClient<T> {
    constructor(public rootUrl: string, public token?: Token) {}

    private addTokens(token: Token): HTTPHeader {
        if (token.type.toUpperCase() === 'BEARER') {
            return {
                Authorization: `${token.type} ${token.value}`,
            };
        } else {
            console.error(
                'Received non-Bearer Token',
                JSON.stringify(token, null, 4)
            );
            throw new Error('Invalid Auth token type');
        }
    }

    fetch(): AxiosPromise {
        let headers: HTTPHeader = {};

        if (this.token) {
            headers = this.addTokens(this.token);
        }

        return axios.get(`${this.rootUrl}`, { headers });
    }

    // tslint:disable-next-line: no-any
    post(body: { [key: string]: any }): AxiosPromise {
        let headers: HTTPHeader = {};

        if (this.token) {
            headers = this.addTokens(this.token);
        }

        return axios.post(`${this.rootUrl}`, body, { headers });
    }

    // tslint:disable-next-line: no-any
    patch(body: { [key: string]: any }): AxiosPromise {
        let headers: HTTPHeader = {};

        if (this.token) {
            headers = this.addTokens(this.token);
        }

        return axios.patch(`${this.rootUrl}`, body, { headers });
    }

    // tslint:disable-next-line: no-any
    delete(): AxiosPromise {
        let headers: HTTPHeader = {};

        if (this.token) {
            headers = this.addTokens(this.token);
        }

        return axios.delete(`${this.rootUrl}`, { headers });
    }
}
