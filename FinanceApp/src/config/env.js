import { Platform } from 'react-native';

/**
 * Environment configuration with smart multi-platform resolution.
 * Automatically handles USB adb reverse (localhost:5000), Wi-Fi LAN IP (10.10.66.224),
 * and Android emulator host IP (10.0.2.2).
 */

const CANDIDATE_HOSTS = [
  'http://localhost:5000/api',
  'http://10.10.66.224:5000/api',
  'http://10.0.2.2:5000/api',
  'http://127.0.0.1:5000/api',
];

export const ENV = {
  // Base REST API URL candidates
  API_BASE_URL: CANDIDATE_HOSTS[0],
  FALLBACK_HOSTS: CANDIDATE_HOSTS,
  API_TIMEOUT_MS: 10000,

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