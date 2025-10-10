export interface DateRange {
    startDate: string;
    endDate: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    metadata?: {
        source: 'cache' | 'database';
        queryTime: number;
        recordCount: number;
    };
    error?: string;
}
export interface CacheStats {
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
    lastUpdate?: string;
}
export interface Detection {
    id: number;
    scenario_name: string;
    status: string;
    detection_date: string;
    status_change_date: string | null;
    modified_by: string | null;
}
export interface DetectionKPIs {
    alertCount: number;
    pendingCount: number;
    delayedCount: number;
    suspiciousInitialCount: number;
    falsePositiveInitialCount: number;
    waitingForEvidenceCount: number;
    sentSARCount: number;
    suspiciousFinalCount: number;
    falsePositiveFinalCount: number;
    processedAlertsCount: number;
    pendingSARCount: number;
}
export interface ScreeningRecord {
    id: number;
    customer_id: string;
    screening_date: string;
    status: string;
    hit_type?: string;
    investigator?: string;
    resolution_date?: string;
}
export interface OnboardingAlert {
    id: number;
    customer_id: string;
    alert_date: string;
    status: string;
    investigator?: string;
}
export interface ScreeningKPIs {
    totalScreening: number;
    pendingScreening: number;
    completedScreening: number;
    hitRate: number;
}
export interface GoAMLReport {
    id: number;
    report_id: string;
    report_date: string;
    reporter: string;
    status: string;
    submission_date?: string;
    entity_count?: number;
}
export interface GoAMLKPIs {
    totalReports: number;
    submittedReports: number;
    pendingReports: number;
    draftReports: number;
}
export interface GoogleSheetsConfig {
    credentials: {
        type: string;
        project_id: string;
        private_key: string;
        client_email: string;
    };
    sheets: {
        screening: SheetConfig;
        goaml: SheetConfig;
    };
}
export interface SheetConfig {
    sheetId: string;
    range: string;
}
export interface SheetMetadata {
    title: string;
    sheetCount: number;
    lastModified: string;
}
export interface OracleConfig {
    user: string;
    password: string;
    connectString: string;
}
export interface DataSourceHealth {
    name: string;
    type: 'oracle' | 'googlesheets' | 'redis';
    healthy: boolean;
    lastChecked: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map