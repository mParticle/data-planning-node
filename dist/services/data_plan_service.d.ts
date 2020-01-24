import { DataPlan, DataPlanDocument, DataPlanResults } from '@mparticle/data-planning-models';
import { Batch, BaseEvent } from '@mparticle/event-models';
export declare class DataPlanService {
    private getAPIURL;
    getPlan(orgId: number, accountId: number, dataPlanId: string, workspaceId: number, token: string): Promise<DataPlan>;
    getAllPlans(orgId: number, accountId: number, workspaceId: number, token: string): Promise<DataPlan[]>;
    getVersionDocument(orgId: number, accountId: number, dataPlanId: string, workspaceId: number, versionNumber: number, token: string): Promise<DataPlanDocument>;
    validateEvent(event: BaseEvent, document: DataPlanDocument): DataPlanResults;
    validateBatch(batch: Batch, document: DataPlanDocument): DataPlanResults;
}
