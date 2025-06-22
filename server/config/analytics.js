
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';

dotenv.config();

const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
let analyticsDataClient;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS && GA_PROPERTY_ID) {
  try {
    analyticsDataClient = new BetaAnalyticsDataClient();
    console.log("Google Analytics Data API client initialized.");
  } catch (e) {
    console.error("Failed to initialize Google Analytics Data API client:", e.message);
    analyticsDataClient = null; // Ensure it's null if initialization fails
  }
} else {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. Real-time analytics will be disabled.");
  }
  if (!GA_PROPERTY_ID) {
    console.warn("WARNING: GA_PROPERTY_ID not set. Real-time analytics will be disabled.");
  }
  analyticsDataClient = null;
}

export { analyticsDataClient, GA_PROPERTY_ID };
