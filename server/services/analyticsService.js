
import { analyticsDataClient, GA_PROPERTY_ID } from '../config/analytics.js';

class AnalyticsServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details; // For more specific error info if needed
  }
}

export const fetchRealtimeAnalytics = async () => {
  if (!analyticsDataClient || !GA_PROPERTY_ID) {
    console.warn('Analytics service called but not configured (client or property ID missing).');
    return { 
      message: 'Real-time analytics service is not configured or unavailable on the server.',
      activeUsers: 0,
      topPages: []
    };
  }

  try {
    const [realtimeReport] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${GA_PROPERTY_ID}`,
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'unifiedScreenName' }], // Use unifiedScreenName for GA4
      metricAggregations: ['TOTAL'], // Ensure totals are requested
      limit: 5, // Limit the number of top pages returned
    });

    let activeUsers = 0;
    // @ts-ignore
    if (realtimeReport.totals && realtimeReport.totals.length > 0 && realtimeReport.totals[0].metricValues && realtimeReport.totals[0].metricValues.length > 0) {
        // @ts-ignore
        activeUsers = parseInt(realtimeReport.totals[0].metricValues[0].value, 10);
    } else {
        // Fallback or alternative way to sum active users if totals block is not as expected
        // This might be needed if individual rows represent segments of active users
        // @ts-ignore
        activeUsers = realtimeReport.rows?.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0", 10), 0) || 0;
        if(realtimeReport.rowCount === 0) activeUsers = 0; // if no rows, means 0 active users
    }
    
    // @ts-ignore
    const topPages = realtimeReport.rows?.map(row => ({
      // @ts-ignore
      name: row.dimensionValues?.[0]?.value || 'Unknown Page/Direct',
      // @ts-ignore
      users: parseInt(row.metricValues?.[0]?.value || "0", 10)
    })) || [];

    return { activeUsers, topPages };

  } catch (error) {
    console.error('Error fetching real-time analytics from GA Data API:', error.message);
    let errorMessage = `Failed to fetch real-time analytics: ${error.message || 'Unknown GA API Error'}`;
    let statusCode = 500;

    if (error.code === 7 || error.message?.includes('Service account does not have permission')) {
      errorMessage = 'Service account does not have permission to access the GA property.';
      statusCode = 403; // Forbidden
    } else if (error.message?.includes('property_not_found') || error.message?.includes('Property ID is not valid')) {
      errorMessage = `GA Property ID '${GA_PROPERTY_ID}' not found or invalid.`;
      statusCode = 404; // Not Found
    }
    // Throw a custom error that the route can catch and use statusCode
    throw new AnalyticsServiceError(errorMessage, statusCode, error.details);
  }
};
