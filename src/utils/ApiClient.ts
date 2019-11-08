import axios, { AxiosPromise } from 'axios';

export class ApiClient<T> {
    constructor(public rootUrl: string, public token?: string) {}

    fetch(): AxiosPromise {
        const headers: { [key: string]: string } = {};

        if (this.token) {
            headers['Authorization'] = `bearer ${this.token}`;
        }

        return axios.get(`${this.rootUrl}`, {
            headers,
        });
    }
}
