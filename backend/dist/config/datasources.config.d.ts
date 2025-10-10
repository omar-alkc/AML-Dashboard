import { OracleConfig } from '../types';
export declare const config: {
    server: {
        port: number;
        env: string;
    };
    oracleAML: OracleConfig;
    oracleScreening: OracleConfig;
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    cache: {
        months: number;
        dailyUpdateHour: number;
        defaultTTL: number;
        aggregateTTL: number;
    };
};
//# sourceMappingURL=datasources.config.d.ts.map