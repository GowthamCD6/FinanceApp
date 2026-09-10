import { Platform } from 'react-native';

/**
 * Environment configuration with smart multi-platform resolution.
 * Automatically handles Android emulator host IP (10.0.2.2) vs iOS/desktop (localhost).
 */

const DEFAULT_DEV_HOST = 'http://10.10.70.39:5000/api';

export const ENV = {
  // Base REST API URL configured from .env
  API_BASE_URL: DEFAULT_DEV_HOST,
  API_TIMEOUT_MS: 8000,


  // App Metadata
  APP_ENV: 'development',
  APP_NAME: 'FundFlow Lending & Fund Circulation Engine',
  APP_VERSION: '1.0.0',

  // Live Database Sync Settings
  ENABLE_LIVE_DB_SYNC: true,
  ENABLE_OFFLINE_FALLBACK: true,
  POLLING_SYNC_INTERVAL_MS: 15000,

  // Default Central Fund Accounts
  DEFAULT_FUND_ACCOUNT_ID: 1, // CASH_MAIN
};

export default ENV;
