import { ApiClient } from '../utils/ApiClient';
import { config } from './config';
import { AxiosResponse } from 'axios';

export class AuthClient {
    constructor(public clientId: string, public clientSecret: string) {}

    async getToken(): Promise<Token | undefined> {
        const api = new ApiClient<TokenAPIResponse>(config.auth.url);

        const body = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            audience: config.auth.audienceUrl,
            grant_type: config.auth.grant_type,
        };

        try {
            return api.post(body).then((response: AxiosResponse) => ({
                type: response?.data?.token_type,
                value: response?.data?.access_token,
            }));
        } catch (error) {
            return error.response;
        }
    }
}

export interface TokenAPIResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export interface Token {
    type: string;
    value: string;
}
