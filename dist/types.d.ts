export declare enum ActivatedEnvironment {
    Development = "development",
    Production = "production"
}
export declare enum DataPlanMatchType {
    Unknown = "unknown",
    SessionStart = "session_start",
    SessionEnd = "session_end",
    ScreenView = "screen_view",
    CustomEvent = "custom_event",
    CrashReport = "crash_report",
    OptOut = "opt_out",
    FirstRun = "first_run",
    ApplicationStateTransition = "application_state_transition",
    NetworkPerformance = "network_performance",
    Breadcrumb = "breadcrumb",
    Profile = "profile",
    Commerce = "commerce",
    UserAttributeChange = "user_attribute_change",
    UserIdentityChange = "user_identity_chagne",
    Uninstall = "uninstall",
    Media = "media",
    UserAttributes = "user_attributes",
    UserIdentities = "user_identities",
    ProductAction = "product_action",
    PromotionAction = "promotion_action",
    ProductImpression = "product_impression"
}
export declare enum MessageType {
    Unknown = "unknown",
    SessionStart = "session_start",
    SessionEnd = "session_end",
    ScreenView = "screen_view",
    CustomEvent = "custom_event",
    CrashReport = "crash_report",
    OptOut = "opt_out",
    FirstRun = "first_run",
    ApplicationStateTransition = "application_state_transition",
    NetworkPerformance = "network_performance",
    Breadcrumb = "breadcrumb",
    Profile = "profile",
    Commerce = "commerce_event",
    UserAttributeChange = "user_attribute_change",
    UserIdentityChange = "user_identity_chagne",
    Uninstall = "uninstall",
    Media = "media"
}
export declare enum EventType {
    Unknown = "unknown",
    Navigation = "navigation",
    Location = "location",
    Search = "search",
    Transaction = "transaction",
    UserContent = "user_content",
    UserPreference = "user_preference",
    Social = "social",
    Other = "other",
    Media = "media"
}
export declare enum DataPlanValidatorType {
    Unknown = "unknown",
    JSONSchema = "json_schema"
}
export declare type Dictionary = {
    [key: string]: any;
};
