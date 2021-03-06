import { TestDataFactory } from './test_data_factory';
import {
    BaseEvent,
    CustomEventData,
    ScreenViewEvent,
    ScreenViewEventData,
    CommonEventData,
    CustomEventDataCustomEventTypeEnum,
    EventTypeEnum,
} from '@mparticle/event-models';
import faker from 'faker';

const commonEventData = (): CommonEventData => ({
    timestamp_unixtime_ms: new Date(faker.date.recent()).getTime(),
});

export const EventFactory = new TestDataFactory<BaseEvent>(() => {
    return {
        event_type: EventTypeEnum.customEvent,
        data: {},
    };
});

export const CustomEventFactory = new TestDataFactory<BaseEvent>(() => {
    const data: CustomEventData = {
        event_name: 'Test User Content',
        custom_event_type: CustomEventDataCustomEventTypeEnum.userContent,
    };

    return {
        event_type: EventTypeEnum.customEvent,
        data,
    };
});

export const ScreenViewEventFactory = new TestDataFactory<ScreenViewEvent>(
    () => {
        const data: ScreenViewEventData = {
            screen_name: 'Test Screen View',
        };

        return {
            event_type: EventTypeEnum.screenView,
            data,
        };
    }
);
