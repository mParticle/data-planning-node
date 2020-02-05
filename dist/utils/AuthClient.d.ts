export declare class AuthClient {
    clientId: string;
    clientSecret: string;
    constructor(clientId: string, clientSecret: string);
    getToken(): Promise<Token | undefined>;
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
