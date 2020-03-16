import path from 'path';
import { URL } from 'url';
import { AxiosResponse } from 'axios';

import {
    DataPlan,
    DataPlanDocument,
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

interface AccessCredentials {
    workspaceId: number;
    clientId: string;
    clientSecret: string;
}

interface ValidationOptions {
    serverMode?: boolean;
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
            } else {
                throw new Error(
                    'Invalid Credentials for generating API Request'
                );
            }
        }
    }

    private async getToken(): Promise<Token | undefined> {
        if (this.clientId && this.clientSecret) {
            return new AuthClient(this.clientId, this.clientSecret).getToken();
        } else {
            return undefined;
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

    // TODO: Refactor this with getAPIUrl
    private getValidationAPIURL(): string {
        const { workspaceId } = this;
        const urlPath = path.join(
            config.dataPlanningPath,
            `${workspaceId}`,
            `test`
        );
        return this.buildUrl(config.apiRoot, urlPath);
    }

    async createDataPlan(dataPlanToCreate: DataPlan): Promise<DataPlan> {
        const token = await this.getToken();
        const api = new ApiClient<DataPlan>(this.apiURL, token);

        try {
            return api
                .post(dataPlanToCreate)
                .then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async createDataPlanVersion(
        dataPlanId: string,
        dataPlanVersion: DataPlanVersion
    ): Promise<DataPlanVersion> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}/versions`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .post(dataPlanVersion)
                .then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async deleteDataPlan(dataPlanId: string): Promise<boolean> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            // If this doesn't throw an arror, it should return true
            return api.delete().then((response: AxiosResponse) => true);
        } catch (error) {
            return error.response;
        }
    }

    async deleteDataPlanVersion(
        dataPlanId: string,
        versionNumber: number
    ): Promise<boolean> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}/versions/${versionNumber}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            // If this doesn't throw an arror, it should return true
            return api.delete().then((response: AxiosResponse) => true);
        } catch (error) {
            return error.response;
        }
    }

    async getDataPlan(dataPlanId: string): Promise<DataPlan> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async getDataPlans(): Promise<DataPlan[]> {
        const token = await this.getToken();
        const url = this.apiURL;
        const api = new ApiClient<DataPlan[]>(url, token);

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async getDataPlanVersion(
        dataPlanId: string,
        versionNumber: number
    ): Promise<DataPlanDocument> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}/versions/${versionNumber}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async updateDataPlan(
        dataPlanId: string,
        dataPlan: DataPlan
    ): Promise<DataPlan> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}`;
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .patch(dataPlan)
                .then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async updateDataPlanVersion(
        dataPlanId: string,
        versionNumber: number,
        dataPlanVersion: DataPlanVersion
    ): Promise<DataPlanVersion> {
        const token = await this.getToken();
        const url = this.apiURL + `/${dataPlanId}/versions/${versionNumber}`;
        const api = new ApiClient<DataPlanVersion>(url, token);

        try {
            return api
                .patch(dataPlanVersion)
                .then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
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
        const url = this.getValidationAPIURL();
        const api = new ApiClient<DataPlan>(url, token);

        try {
            return api
                .post({
                    document,
                    batch,
                })
                .then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }
}
