import path from 'path';
import { URL } from 'url';
import { AxiosResponse } from 'axios';

import {
    DataPlan,
    DataPlanResults,
    DataPlanVersion,
} from '@mparticle/data-planning-models';
import {
    Batch,
    BaseEvent,
    BatchEnvironmentEnum,
} from '@mparticle/event-models';
import { ApiClient } from '../utils/ApiClient';
import { AuthClient, Token } from '../utils/AuthClient';
import { DataPlanEventValidator } from '../data_planning/data_plan_event_validator';
import { config } from '../utils/config';

export interface AccessCredentials {
    workspaceId: number;
    clientId: string;
    clientSecret: string;
}

export interface ValidationOptions {
    serverMode?: boolean;
}

export interface DataPlanServiceErrors {
    errors: {
        message: string;
    };
}

export class DataPlanService {
    private workspaceId?: number;
    private clientId?: string;
    private clientSecret?: string;
    private apiURL = '';

    constructor(credentials?: AccessCredentials) {
        if (credentials) {
            const { workspaceId, clientId, clientSecret } = credentials;

            if (workspaceId && clientId && clientSecret) {
                this.workspaceId = workspaceId;

                this.clientId = clientId;
                this.clientSecret = clientSecret;

                this.apiURL = this.getAPIURL();
            }
        }
    }

    private async getToken(): Promise<Token | undefined> {
        if (this.clientId && this.clientSecret) {
            return new AuthClient(this.clientId, this.clientSecret).getToken();
        } else {
            throw new Error(
                'Cannot Generate Token. Client ID and Secret are invalid'
            );
        }
    }

    private buildUrl(base: string, path: string): string {
        return new URL(path, base).toString();
    }

    private getAPIURL(): string {
        const { workspaceId } = this;
        const urlPath = path.join(
            config.dataPlanningPath,
            `${workspaceId}`,
            `plans`
        );
        return this.buildUrl(config.apiRoot, urlPath);
    }

    async createDataPlan(dataPlanToCreate: DataPlan): Promise<DataPlan> {
        const token = await this.getToken();
        const api = new ApiClient<DataPlan>(this.apiURL, token);

        try {
            return api
                .post(dataPlanToCreate)
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async createDataPlanVersion(
        dataPlanId: string,
        dataPlanVersion: DataPlanVersion
    ): Promise<DataPlanVersion> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        const url = this.apiURL + `/${dataPlanId}/versions`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .post(dataPlanVersion)
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteDataPlan(dataPlanId: string): Promise<boolean> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        const url = this.apiURL + `/${dataPlanId}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .delete()
                .then((response: AxiosResponse) => true)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteDataPlanVersion(
        dataPlanId: string,
        versionNumber: number
    ): Promise<boolean> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        if (!versionNumber) {
            throw new Error(`Missing versionNumber (${versionNumber})`);
        }

        const url = this.apiURL + `/${dataPlanId}/versions/${versionNumber}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .delete()
                .then(() => true)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDataPlan(dataPlanId: string): Promise<DataPlan> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        const url = this.apiURL + `/${dataPlanId}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .fetch()
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDataPlans(): Promise<DataPlan[]> {
        const token = await this.getToken();
        const url = this.apiURL;
        const api = new ApiClient<DataPlan[]>(url, token);

        try {
            return api
                .fetch()
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDataPlanVersion(
        dataPlanId: string,
        versionNumber: number
    ): Promise<DataPlanVersion> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        if (!versionNumber) {
            throw new Error(`Missing versionNumber (${versionNumber})`);
        }

        const url = this.apiURL + `/${dataPlanId}/versions/${versionNumber}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .fetch()
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateDataPlan(
        dataPlanId: string,
        dataPlan: DataPlan
    ): Promise<DataPlan> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        const url = this.apiURL + `/${dataPlanId}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .patch(dataPlan)
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateDataPlanVersion(
        dataPlanId: string,
        versionNumber: number,
        dataPlanVersion: DataPlanVersion
    ): Promise<DataPlanVersion> {
        const token = await this.getToken();

        if (!dataPlanId) {
            throw new Error(`Missing dataPlanId (${dataPlanId})`);
        }

        if (!versionNumber) {
            throw new Error(`Missing versionNumber (${versionNumber})`);
        }

        const url = this.apiURL + `/${dataPlanId}/versions/${versionNumber}`;
        const api = new ApiClient<DataPlanVersion>(url, token);

        try {
            return api
                .patch(dataPlanVersion)
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }

    validateEvent(
        event: BaseEvent,
        dataPlanVersion: DataPlanVersion,
        options?: ValidationOptions
    ): Promise<DataPlanResults> {
        if (!event || !dataPlanVersion) {
            return Promise.reject(
                'Data Plan Version or Event is missing and required'
            );
        }

        const document = dataPlanVersion.version_document;

        if (!document) {
            return Promise.reject(
                'Data Plan Version does not contain a valid Version Document'
            );
        }

        const serverMode = options?.serverMode;

        // Create a mock batch so we can pass an event to the server
        const mpid = '';
        const environment = BatchEnvironmentEnum.unknown;

        if (serverMode) {
            const batch: Batch = {
                events: [event],
                mpid,
                environment,
            };
            return this.validateOnServer(batch, dataPlanVersion, options);
        } else {
            const resultsDto: DataPlanResults = {};
            const validator = new DataPlanEventValidator(document);
            const result = validator.validateEvent(event);

            resultsDto.results = [result];

            return Promise.resolve(resultsDto);
        }
    }

    validateBatch(
        batch: Batch,
        dataPlanVersion: DataPlanVersion,
        options?: ValidationOptions
    ): Promise<DataPlanResults> {
        if (!batch || !dataPlanVersion) {
            return Promise.reject(
                'Data Plan Version or Batch is missing and required'
            );
        }

        const document = dataPlanVersion.version_document;

        if (!document) {
            return Promise.reject(
                'Data Plan Version does not contain a valid Version Document'
            );
        }

        const serverMode = options?.serverMode;

        if (serverMode) {
            return this.validateOnServer(batch, dataPlanVersion, options);
        } else {
            const resultsDto: DataPlanResults = {};
            const validator = new DataPlanEventValidator(document, batch);
            const results = validator.validateEventBatch(batch);

            resultsDto.batch = batch;
            resultsDto.results = results;

            return Promise.resolve(resultsDto);
        }
    }

    private async validateOnServer(
        batch: Batch,
        dataPlanVersion: DataPlanVersion,
        options?: ValidationOptions
    ): Promise<DataPlanResults> {
        const document = dataPlanVersion.version_document;

        if (!document) {
            throw new Error(
                'Data Plan Version does not contain a valid Version Document'
            );
        }

        const token = await this.getToken();
        const url = this.getAPIURL() + '/validate';
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .post({
                    document,
                    batch,
                })
                .then((response: AxiosResponse) => response.data)
                .catch(error =>
                    Promise.reject(
                        error.response.data
                            ? (error.response.data as DataPlanServiceErrors)
                            : error
                    )
                );
        } catch (error) {
            throw new Error(error);
        }
    }
}
