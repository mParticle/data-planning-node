import path from 'path';
import { URL } from 'url';
import { AxiosResponse } from 'axios';

import {
    DataPlan,
    DataPlanDocument,
    DataPlanResults,
} from '@mparticle/data-planning-models';
import { Batch, BaseEvent } from '@mparticle/event-models';
import { ApiClient } from '../utils/ApiClient';
import { AuthClient, Token } from '../utils/AuthClient';
import { DataPlanEventValidator } from '../data_planning/data_plan_event_validator';
import { config } from '../utils/config';

interface AccessCredentials {
    orgId: number;
    accountId: number;
    workspaceId: number;
    clientId: string;
    clientSecret: string;
}

export class DataPlanService {
    private orgId?: number;
    private accountId?: number;
    private workspaceId?: number;
    private clientId?: string;
    private clientSecret?: string;
    private apiURL?: string;

    constructor(credentials?: AccessCredentials) {
        if (credentials) {
            const {
                orgId,
                accountId,
                workspaceId,
                clientId,
                clientSecret,
            } = credentials;

            this.orgId = orgId;
            this.accountId = accountId;
            this.workspaceId = workspaceId;
            this.clientId = clientId;
            this.clientSecret = clientSecret;

            this.apiURL = this.getAPIURL();
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
        const { orgId, accountId, workspaceId } = this;
        if (orgId && accountId && workspaceId) {
            const urlPath = path.join(
                config.dataPlanningPath,
                `${orgId}`,
                `${accountId}`,
                `${workspaceId}`,
                `plans/`
            );
            return this.buildUrl(config.apiRoot, urlPath);
        }
        throw new Error('Invalid Credentials for generating API Request');
    }

    async getDataPlan(dataPlanId: string): Promise<DataPlan> {
        if (!this.apiURL) {
            throw new Error('Invalid API URL');
        }

        const token = await this.getToken();
        const api = new ApiClient<DataPlan>(
            this.buildUrl(this.apiURL, dataPlanId),
            token
        );

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async getDataPlans(): Promise<DataPlan[]> {
        const token = await this.getToken();

        if (!this.apiURL) {
            throw new Error('Invalid API URL');
        }

        const api = new ApiClient<DataPlan[]>(this.apiURL, token);

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
        if (!this.apiURL) {
            throw new Error('Invalid API URL');
        }

        const token = await this.getToken();
        const api = new ApiClient<DataPlan>(
            this.buildUrl(
                this.apiURL,
                `${dataPlanId}/versions/${versionNumber}`
            ),
            token
        );

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    validateEvent(
        event: BaseEvent,
        document: DataPlanDocument
    ): DataPlanResults {
        if (!event || !document) {
            throw new Error(
                'Data Plan Document and Event are missing and required'
            );
        }

        const resultsDto: DataPlanResults = {};
        const validator = new DataPlanEventValidator(document);
        const result = validator.validateEvent(event);

        resultsDto.results = [result];

        return resultsDto;
    }

    validateBatch(batch: Batch, document: DataPlanDocument): DataPlanResults {
        if (!batch || !document) {
            throw new Error(
                'Data Plan Document and Batch are missing and required'
            );
        }

        const resultsDto: DataPlanResults = {};
        const validator = new DataPlanEventValidator(document, batch);
        const results = validator.validateEventBatch(batch);

        resultsDto.batch = batch;
        resultsDto.results = results;

        return resultsDto;
    }
}
