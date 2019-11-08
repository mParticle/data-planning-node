export enum ActivatedEnvironment {
    Development = 'development',
    Production = 'production',
}

export enum DataPlanMatchType {
    Unknown = 'unknown', // 0
    SessionStart = 'session_start', // 1
    SessionEnd = 'session_end', // 2
    ScreenView = 'screen_view', // 3
    CustomEvent = 'custom_event', // 4
    CrashReport = 'crash_report', // 5
    OptOut = 'opt_out', // 6
    FirstRun = 'first_run', // 7
    ApplicationStateTransition = 'application_state_transition', // 10
    NetworkPerformance = 'network_performance', // 12
    Breadcrumb = 'breadcrumb', // 13
    Profile = 'profile', // 14
    Commerce = 'commerce', // 16
    UserAttributeChange = 'user_attribute_change', // 17
    UserIdentityChange = 'user_identity_chagne', // 18
    Uninstall = 'uninstall', // 19
    Media = 'media', // 20

    // Data Planning Specific
    UserAttributes = 'user_attributes',
    UserIdentities = 'user_identities',
    ProductAction = 'product_action',
    PromotionAction = 'promotion_action',
    ProductImpression = 'product_impression',
}

export enum MessageType {
    Unknown = 'unknown', // 0
    SessionStart = 'session_start', // 1
    SessionEnd = 'session_end', // 2
    ScreenView = 'screen_view', // 3
    CustomEvent = 'custom_event', // 4
    CrashReport = 'crash_report', // 5
    OptOut = 'opt_out', // 6
    FirstRun = 'first_run', // 7
    ApplicationStateTransition = 'application_state_transition', // 10
    NetworkPerformance = 'network_performance', // 12
    Breadcrumb = 'breadcrumb', // 13
    Profile = 'profile', // 14
    Commerce = 'commerce_event', // 16
    UserAttributeChange = 'user_attribute_change', // 17
    UserIdentityChange = 'user_identity_chagne', // 18
    Uninstall = 'uninstall', // 19
    Media = 'media', // 20
}

export enum EventType {
    Unknown = 'unknown', // 0
    Navigation = 'navigation', // 1
    Location = 'location', // 2
    Search = 'search', // 3,
    Transaction = 'transaction', // 4
    UserContent = 'user_content', // 5
    UserPreference = 'user_preference', // 6
    Social = 'social', // 7
    Other = 'other', // 8
    Media = 'media', // 9
}

export enum DataPlanValidatorType {
    Unknown = 'unknown', // 0
    JSONSchema = 'json_schema', // 1
}

export type Dictionary = {
    // tslint:disable-next-line: no-any
    [key: string]: any;
};
