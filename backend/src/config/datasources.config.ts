import dotenv from 'dotenv';
import { OracleConfig } from '../types';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  
  oracleAML: {
    user: process.env.ORACLE_AML_USER || 'aml_user',
    password: process.env.ORACLE_AML_PASSWORD || 'aml_password',
    connectString: process.env.ORACLE_AML_CONNECT_STRING || '//localhost:1521/XEPDB1',
  } as OracleConfig,
  
  oracleScreening: {
    user: process.env.ORACLE_SCREENING_USER || 'screening_user',
    password: process.env.ORACLE_SCREENING_PASSWORD || 'screening_password',
    connectString: process.env.ORACLE_SCREENING_CONNECT_STRING || '//localhost:1521/XEPDB1',
  } as OracleConfig,
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  cache: {
    months: parseInt(process.env.CACHE_MONTHS || '3', 10),
    dailyUpdateHour: parseInt(process.env.DAILY_UPDATE_HOUR || '2', 10),
    defaultTTL: 90 * 24 * 60 * 60, // 90 days in seconds
    aggregateTTL: 24 * 60 * 60, // 24 hours in seconds
  },
};

