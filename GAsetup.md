
# Google Analytics Setup Guide (GAsetup.md)

## Complete Setup Instructions for Live Traffic Display on Admin Dashboard

This guide will help you set up Google Analytics to display live traffic data on your AI CV Maker admin dashboard.

### Prerequisites
- Google Analytics 4 (GA4) property already created
- Admin access to Google Analytics
- Google Cloud Console access
- Admin user account in the application

### Step 1: Set Up Google Analytics Tracking

1. **Get your Measurement ID**
   - Go to Google Analytics
   - Navigate to Admin (gear icon) → Data Streams
   - Click on your web stream
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`) (For this app, it's `G-V3TDTYCSVR`)

2. **Add tracking code to your website**
   - The gtag.js script should already be in your `index.html`
   - Verify it matches your Measurement ID (`G-V3TDTYCSVR`).

### Step 2: Enable Google Analytics Data API

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project from the dropdown (create one if you don't have one).

2. **Enable the API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Analytics Data API"
   - Click on it and press "ENABLE"
   - Wait 1-2 minutes for activation.

### Step 3: Create Service Account

1. **Navigate to Service Accounts**
   - In Google Cloud Console, go to "IAM & Admin" → "Service Accounts"
   - Click "+ CREATE SERVICE ACCOUNT"

2. **Configure Service Account**
   - Service account name: `ai-cv-analytics-reader` (or your preferred name)
   - Service account ID: Will be auto-generated (e.g., `ai-cv-analytics-reader@your-project-id`)
   - Description: "Reads Google Analytics data for admin dashboard"
   - Click "CREATE AND CONTINUE"
   - **Grant this service account access to project** (Role): For reading Analytics data, a common role to assign at the project level is "Service Account User" if the service account itself needs to act as a user for other services, but primarily, the access to GA data is granted within GA itself (Step 4.3). You can often skip assigning a project-level role here if the only purpose is GA data access via direct GA permissions.
   - Click "CONTINUE".
   - **Grant users access to this service account** (Optional): Skip this step.
   - Click "DONE".

3. **Create JSON Key**
   - Find your new service account in the list (e.g., `ai-cv-analytics-reader@your-project-id.iam.gserviceaccount.com`).
   - Click on the service account email.
   - Go to the "KEYS" tab.
   - Click "ADD KEY" → "Create new key".
   - Select "JSON" as the key type.
   - Click "CREATE". A JSON file will be downloaded automatically.

4. **Save the Key File**
   - Move the downloaded JSON file to a secure location in your project. A common practice is to place it in the root directory or a dedicated `config` directory. For this project, let's assume it's placed in the project root.
   - You can rename it for simplicity, e.g., `service-account-key.json` or `ga-credentials.json`.
   - **IMPORTANT**: Add this JSON key file to your `.gitignore` file to prevent it from being committed to version control. E.g., add `service-account-key.json` to `.gitignore`.

### Step 4: Get Required IDs and Configure Access

1. **Find your GA4 Property ID**
   - Go to your Google Analytics 4 Property.
   - Click Admin (gear icon in the bottom left).
   - In the "Property" column, click "Property Details".
   - Copy the "Property ID" (it's a numeric ID, e.g., `123456789`).

2. **Get Service Account Email**
   - This is the email address of the service account you created in Step 3.2 (e.g., `ai-cv-analytics-reader@your-project-id.iam.gserviceaccount.com`). You can also find this in the downloaded JSON key file under the `"client_email"` field.

3. **Grant Analytics Access to Service Account**
   - In Google Analytics Admin dashboard:
   - Under the "Property" column (ensure the correct GA4 property is selected), click "Property Access Management".
   - Click the blue "+" button in the top right and select "Add users".
   - In the "Email addresses" field, paste the service account email from Step 4.2.
   - Uncheck "Notify new users by email".
   - Under "Direct roles and data restrictions", select the **"Viewer"** role. This is sufficient for reading data.
   - Click "Add" in the top right.

### Step 5: Configure Environment Variables

Create or update your `.env` file in the project root. A full example can be found in the main `README.md` file. Key variables include:

```env
# AI Service API Key
API_KEY=YOUR_ACTUAL_AI_SERVICE_API_KEY

# Google OAuth Client ID (for user Google Sign-In)
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID 
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID 

# Admin Email
ADMIN_EMAIL=admin@example.com 

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
# ... other DB variables

# Google Analytics Data API Configuration
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json 
GA_PROPERTY_ID=YOUR_GA4_PROPERTY_ID 

# Email (Nodemailer SMTP) Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587 
SMTP_SECURE=false 
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME="AI CV Maker"

# Frontend Base URL (for generating links in emails)
FRONTEND_BASE_URL=http://localhost:5173 # Or your production frontend URL
```
- Replace placeholders with your actual values.
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` path matches your service account JSON key file.

### Step 6: Install Dependencies

Ensure the required libraries are installed (they should be in `package.json`):
```bash
npm install @google-analytics/data nodemailer
# or
yarn add @google-analytics/data nodemailer
```

### Step 7: Test the Setup
(As detailed in the main README.md)

### Troubleshooting
(As detailed in the main README.md)

### Security Notes
(As detailed in the main README.md)
