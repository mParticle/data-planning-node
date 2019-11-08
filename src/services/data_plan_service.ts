import {
    DataPlan,
    DataPlanDocument,
    DataPlanResults,
} from '@mparticle/data-planning-models';
import { ApiClient } from '../utils/ApiClient';
import { Batch, BaseEvent } from '@mparticle/event-models';
import { DataPlanEventValidator } from '../data_planning/data_plan_event_validator';
import { AxiosResponse } from 'axios';
import { config } from '../utils/config';

export class DataPlanService {
    private getAPIURL(
        orgId: number,
        accountId: number,
        workspaceId: number
    ): string {
        return [
            `${config.apiRoot}/${config.dataPlanningPath}/`,
            `${orgId}/`,
            `${accountId}/`,
            `${workspaceId}/`,
            `plans/`,
        ].join('');
    }
    async getPlan(
        orgId: number,
        accountId: number,
        dataPlanId: string,
        workspaceId: number,
        token: string
    ): Promise<DataPlan> {
        const url = this.getAPIURL(orgId, accountId, workspaceId);
        const api = new ApiClient<DataPlan>(url + dataPlanId, token);

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async getAllPlans(
        orgId: number,
        accountId: number,
        workspaceId: number,
        token: string
    ): Promise<DataPlan[]> {
        const url = this.getAPIURL(orgId, accountId, workspaceId);
        const api = new ApiClient<DataPlan[]>(url, token);

        try {
            return api.fetch().then((response: AxiosResponse) => response.data);
        } catch (error) {
            return error.response;
        }
    }

    async getVersionDocument(
        orgId: number,
        accountId: number,
        dataPlanId: string,
        workspaceId: number,
        versionNumber: number,
        token: string
    ): Promise<DataPlanDocument> {
        const url = this.getAPIURL(orgId, accountId, workspaceId);
        const api = new ApiClient<DataPlan>(
            `${url}${dataPlanId}/versions/${versionNumber}`,
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
