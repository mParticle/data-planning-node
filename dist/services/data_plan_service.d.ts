import { DataPlan, DataPlanDocument, DataPlanResults } from '@mparticle/data-planning-models';
import { Batch, BaseEvent } from '@mparticle/event-models';
interface AccessCredentials {
    orgId: number;
    accountId: number;
    workspaceId: number;
    clientId: string;
    clientSecret: string;
}
export declare class DataPlanService {
    private orgId?;
    private accountId?;
    private workspaceId?;
    private clientId?;
    private clientSecret?;
    private apiURL?;
    constructor(credentials?: AccessCredentials);
    private getToken;
    private buildUrl;
    private getAPIURL;
    getPlan(dataPlanId: string): Promise<DataPlan>;
    getAllPlans(): Promise<DataPlan[]>;
    getVersionDocument(dataPlanId: string, versionNumber: number): Promise<DataPlanDocument>;
    validateEvent(event: BaseEvent, document: DataPlanDocument): DataPlanResults;
    validateBatch(batch: Batch, document: DataPlanDocument): DataPlanResults;
}
export {};
