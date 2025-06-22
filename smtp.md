# SMTP Setup Guide for AI CV Maker (smtp.md)

This guide provides "baby steps" to help you configure SMTP (Simple Mail Transfer Protocol) for your AI CV Maker application. SMTP is necessary for the application to send emails, such as account verification links and password reset instructions.

## 1. What is SMTP and Why Do You Need It?

*   **What it is:** Think of SMTP as the digital mailman for your application. It's a standard way for email servers to send messages across the internet.
*   **Why you need it:** Your AI CV Maker application needs to send emails to users for:
    *   **Account Verification:** When a new user signs up with an email and password.
    *   **Password Resets:** When a user forgets their password and requests to reset it.

Without SMTP configured, these essential features will not work.

## 2. What You Need Before You Start (Your Email Credentials)

To send emails, your application needs to log in to an email account, just like you do. You'll need the following details from your email provider:

*   **An Email Account:** This is the email address the application will use to send emails from (e.g., `admin@onlinecvgenius.com`, `yourapp@gmail.com`).
*   **Email Account Password:** The **actual password** for this specific email account.
*   **SMTP Server Address (Host):** The address of your email provider's outgoing mail server.
    *   You have: `mail.onlinecvgenius.com`
*   **SMTP Port Number:** The specific "door number" on the server for sending email.
    *   You have: `465` (This is common for SSL/TLS encrypted connections).
*   **Encryption Method (SSL/TLS):** Whether the connection to the SMTP server should be encrypted.
    *   You have port `465`, which typically means `SMTP_SECURE=true` (SSL/TLS).

## 3. Finding Your SMTP Details (If You Didn't Have Them)

If you're using a different email provider or need to find these details, here's how:

*   **General Advice:** The best place to find SMTP settings is your email provider's official help or support documentation. Search online for "SMTP settings for [Your Email Provider's Name]".
*   **Common Email Providers:**
    *   **Gmail / Google Workspace:**
        *   Host: `smtp.gmail.com`
        *   Port: `465` (for SSL) or `587` (for TLS/STARTTLS)
        *   Secure: `true` for port 465, `false` for port 587.
        *   User: Your full Gmail address (e.g., `youremail@gmail.com`).
        *   Password: Your Gmail password. **Important for Gmail:** It's highly recommended to use an **"App Password"** instead of your main Google account password for better security. (Search "Google App Passwords" to learn how to generate one).
    *   **Outlook.com / Microsoft 365:**
        *   Host: `smtp.office365.com`
        *   Port: `587` (for TLS/STARTTLS)
        *   Secure: `false` (Nodemailer will use STARTTLS automatically on this port if secure is false).
        *   User: Your full Outlook/Microsoft email address.
        *   Password: Your email account password.
    *   **Custom Domain Email Hosting (like your `onlinecvgenius.com`):**
        *   These details are provided by your email hosting company (often the same as your web hosting company).
        *   **Your current details for `admin@onlinecvgenius.com` appear to be:**
            *   SMTP Host: `mail.onlinecvgenius.com`
            *   SMTP Port: `465`
            *   SMTP Secure setting: `true`
            *   SMTP User: `admin@onlinecvgenius.com`
            *   SMTP Password: **YOUR_ACTUAL_PASSWORD_FOR_admin@onlinecvgenius.com** (Ensure this is correct and secure. The value `fb3bbc2c3ddr` from your original prompt is an example and likely incorrect if you see authentication errors).

## 4. Setting Up Your `.env` File

The `.env` file in your project's main folder stores configuration and secrets. Your backend server (`server/main.js`) reads these SMTP settings.

1.  **Locate or Create `.env`:** Make sure you have a `.env` file in the root directory of your project.
2.  **Add/Update SMTP Variables:** Add or modify the following lines in your `.env` file, replacing the example values with **your actual credentials**:

    ```dotenv
    # --------------------- SMTP / Email Configuration ----------------------
    # Hostname for your outgoing (SMTP) mail server
    SMTP_HOST=mail.onlinecvgenius.com

    # Port for SMTP: 465 for SSL/TLS, 587 for STARTTLS
    SMTP_PORT=465

    # Use 'true' if your SMTP_PORT is 465 (SSL/TLS).
    # Use 'false' if your SMTP_PORT is 587 (Nodemailer will try STARTTLS).
    SMTP_SECURE=true

    # The email address your application will use to send emails.
    SMTP_USER=admin@onlinecvgenius.com

    # The password for the SMTP_USER email account.
    # !! VERY IMPORTANT: Use your REAL password. Keep this file and password SECRET. !!
    # !! The example password 'fb3bbc2c3ddr' WILL NOT WORK if it's not your actual password. !!
    # !! DO NOT commit your actual password to Git or GitHub. !!
    SMTP_PASS=YOUR_ACTUAL_EMAIL_PASSWORD_FOR_admin@onlinecvgenius.com_HERE

    # The "From" email address that recipients will see.
    SMTP_FROM_EMAIL=admin@onlinecvgenius.com

    # The "From" name that recipients will see (e.g., "AI CV Maker", "Online CV Genius").
    SMTP_FROM_NAME="Online CV Genius"
    # -----------------------------------------------------------------------
    ```

    *   `SMTP_HOST`: The address of your mail server (e.g., `mail.onlinecvgenius.com`).
    *   `SMTP_PORT`: The port number (e.g., `465` or `587`).
    *   `SMTP_SECURE`:
        *   Set to `true` if you're using port `465` (SSL/TLS).
        *   Set to `false` if you're using port `587` (Nodemailer will attempt STARTTLS, which is also secure).
    *   `SMTP_USER`: The full email address that the application will use to log in and send emails (e.g., `admin@onlinecvgenius.com`).
    *   `SMTP_PASS`: The **actual password** for the `SMTP_USER` email account. **This is highly sensitive and is the most common cause for authentication errors if incorrect.**
    *   `SMTP_FROM_EMAIL`: The email address that will appear in the "From" field of the emails sent by the application. This can often be the same as `SMTP_USER`.
    *   `SMTP_FROM_NAME`: The name that will appear next to the "From" email address (e.g., "Online CV Genius", "AI CV Maker Support").

## 5. Crucial: `FRONTEND_BASE_URL` for Email Links

Your backend server uses the `FRONTEND_BASE_URL` variable from your `.env` file to create the full clickable links in verification and password reset emails.

*   **This URL must be the exact address (including http/https and port) where your frontend application is running and accessible to users.**
*   If this is incorrect, users will click links that lead to the wrong place.

    ```dotenv
    # Frontend Base URL (for generating links in emails by the backend)
    # IMPORTANT: This MUST match the URL (including port) your frontend Vite dev server is accessible at,
    # or your production domain.
    # Example if Vite frontend runs on port 5173:
    FRONTEND_BASE_URL=http://localhost:5173
    # Example if Vite frontend runs on port 3000:
    # FRONTEND_BASE_URL=http://localhost:3000
    # For production:
    # FRONTEND_BASE_URL=https://www.yourdomain.com
    ```
    *(Adjust based on the port your Vite frontend actually runs on, e.g., `5173` as seen in your logs, or other ports like `3000`, `5174` if you change Vite's config).*

## 6. Restart Your Backend Server

Whenever you make changes to the `.env` file, your backend Node.js server **must be restarted** for the changes to take effect.

*   If it's running, stop it (e.g., `Ctrl+C` in the terminal).
*   Start it again (e.g., `node server/main.js` or `npm run start-backend` if you have such a script).

## 7. Testing - Did It Work?

The best way to test your SMTP setup is to trigger an email from the application:

1.  **Ensure `SMTP_PASS` in `.env` is correct.**
2.  **Restart your backend server.**
3.  **Try signing up a new user** with an email address you can access.
4.  Check the inbox (and spam/junk folder) of that email address for the verification email.
5.  If it arrives and the link works, your basic setup is good!
6.  You can also test the "Forgot Password" feature.

## 8. Common Problems & Solutions (Troubleshooting)

*   **Error: "535 Incorrect authentication data" or "Invalid login" in backend logs:**
    *   **This is almost always due to an incorrect `SMTP_PASS` for the given `SMTP_USER` and `SMTP_HOST`.**
    *   **ACTION:** Verify your `SMTP_USER` (e.g., `admin@onlinecvgenius.com`) and **especially your `SMTP_PASS`** in the `.env` file. Ensure it's the exact, current password for that email account on `mail.onlinecvgenius.com`.
    *   The placeholder `fb3bbc2c3ddr` from your original prompt **must be replaced** with your real password.
*   **No email received:**
    *   **Typos:** Double-check every `SMTP_` variable in your `.env` file for typos.
    *   **Incorrect Password:** (See above) This is the most common issue.
    *   **Server Logs:** Check the console output of your backend server (`server/main.js`) when you try to send an email. Nodemailer usually prints helpful error messages.
    *   **Spam/Junk:** Always check the spam or junk folder of the recipient.
    *   **`FRONTEND_BASE_URL`:** While not stopping emails from sending, an incorrect `FRONTEND_BASE_URL` will make links in emails unusable.
    *   **Email Provider Security:**
        *   **Gmail:** If using Gmail and not an App Password, you might need to enable "Less Secure App Access" in your Google account settings (not recommended for long-term). Using an App Password is the correct way.
        *   Other providers might have similar security features or require specific IP whitelisting for third-party applications.
    *   **Firewall:** A firewall on your computer or network might be blocking outgoing connections on the `SMTP_PORT`.
    *   **Port/Secure Mismatch:** Ensure `SMTP_PORT` and `SMTP_SECURE` match your provider's requirements (e.g., port 465 usually needs `SMTP_SECURE=true`; port 587 usually needs `SMTP_SECURE=false`). Your current `.env` lists `SMTP_PORT=465` and `SMTP_SECURE=true` which should be correct for SSL/TLS.
*   **Links in email don't work or go to the wrong page:**
    *   Verify `FRONTEND_BASE_URL` in `.env` is exactly where your frontend application runs and is accessible (e.g., `http://localhost:5173`).

## 9. Very Important Security Reminders!

*   **Keep `.env` SECRET:** Your `.env` file contains sensitive information like database passwords and your SMTP password.
    *   **NEVER commit the `.env` file to Git or share it publicly.** The file `.gitignore` in your project should already list `.env` to prevent this.
*   **Strong SMTP Password:** Use a strong, unique password for the email account specified in `SMTP_USER`.
*   **Gmail App Passwords:** If using Gmail, **strongly consider using an "App Password"**. This is a 16-digit passcode that gives an app permission to access your Google Account, and it's more secure than using your main password.

## 10. Note on `VITE_API_URL` and `VITE_CLIENT_URL` in `.env`

Your `.env` file can also contain variables prefixed with `VITE_` for your frontend code.

*   `VITE_GOOGLE_CLIENT_ID`: Used by your frontend for the Google Sign-In button.
*   `VITE_API_URL`: If your frontend makes absolute API calls (e.g., \`fetch(\`\${import.meta.env.VITE_API_URL}/auth/login\`)\`), this should be your backend's base URL (e.g., `http://localhost:3001`). However, if you use Vite's proxy (recommended) and your service calls are relative (e.g., `fetch('/api/auth/login')`), this variable might not be actively used for those calls.
*   `VITE_CLIENT_URL`: This would typically be the URL of your frontend application itself (e.g., `http://localhost:5173`). Its usage depends on whether your frontend code specifically needs to reference its own base URL.

**The most important URL for email functionality is `FRONTEND_BASE_URL` (without `VITE_` prefix) in your `.env`, as this is used by the backend to construct the links.**

---

By following these steps, and **critically ensuring your `SMTP_PASS` is correct**, you should be able to configure SMTP and get email sending working in your AI CV Maker application. Remember to prioritize security with your credentials!
## Debugging Checklist from Root Cause Analysis (Recap)

### 1. **Test Network Connectivity First**
\`\`\`powershell
# Always test if you can reach the SMTP server
Test-NetConnection -ComputerName mail.onlinecvgenius.com -Port 465
\`\`\`
- ✅ If `TcpTestSucceeded: True` → Network is OK
- ❌ If `TcpTestSucceeded: False` → Network/firewall blocking. Try a different network (e.g., home WiFi, mobile hotspot) if on a corporate network.

### 2. **Test Without Environment Variables (in `server/main.js` temporarily)**
If network is OK, but emails still fail, temporarily hardcode SMTP values in `server/main.js` to isolate if `.env` parsing is the issue.
\`\`\`javascript
// In server/main.js, for testing only:
// const smtpConfig = {
//   host: 'mail.onlinecvgenius.com',
//   port: 465,
//   secure: true, // For port 465
//   auth: {
//     user: 'admin@onlinecvgenius.com',
//     pass: 'YOUR_ACTUAL_PASSWORD_HERE' // Direct password
//   },
// };
// REMEMBER TO REMOVE HARDCODED VALUES AFTER TESTING!
\`\`\`
- ✅ If this works → Issue is with `.env` file loading or parsing.
- ❌ If this fails → Issue is likely wrong credentials, server-side email config, or the email provider itself.

### 3. **Check `.env` File Rules (VERY IMPORTANT)**
- ✅ **DO**: Comments on separate lines:
  \`\`\`env
  # This is a comment
  SMTP_PORT=465
  \`\`\`
- ❌ **DON'T**: Inline comments:
  \`\`\`env
  SMTP_PORT=465 # This breaks, the value becomes "465 # This breaks"
  \`\`\`
- ❌ **DON'T**: Quotes around values (unless the value itself contains spaces, which is rare for these settings):
  \`\`\`env
  SMTP_USER="admin@onlinecvgenius.com"  # Usually not needed, can sometimes cause issues
  SMTP_USER=admin@onlinecvgenius.com    # Better
  \`\`\`
- **CHECK FOR HIDDEN CHARACTERS/SPACES**: Especially at the end of lines in your `.env` file.

### 4. **SMTP Port Guidelines (Confirm `SMTP_SECURE` setting)**
| Port | `SMTP_SECURE` in `.env` | Typical Use Case         |
|------|-------------------------|--------------------------|
| 25   | `false`                 | Often blocked, legacy    |
| 465  | `true`                  | SSL/TLS from the start   |
| 587  | `false`                 | STARTTLS (upgrades to secure) |
| 2525 | `false`                 | Alternative, often STARTTLS |

**Your current `.env` values `SMTP_PORT=465` and `SMTP_SECURE=true` are consistent for an SSL/TLS connection.** If this combination fails, and `Test-NetConnection` on port 465 works, the primary suspect becomes the `SMTP_USER` or `SMTP_PASS`.

### 5. **Verify `SMTP_USER` and `SMTP_PASS`**
- This is the **most common point of failure** if network and port settings seem correct.
- Double, triple-check the `SMTP_PASS` for `admin@onlinecvgenius.com`.
- **Log in to `mail.onlinecvgenius.com` webmail** (if available) with these exact credentials to confirm they are correct.
- If you recently changed the password, ensure the `.env` file is updated.

### 6. **Contact Email Provider Support**
If all else fails, your email hosting provider for `onlinecvgenius.com` may have specific security measures, IP restrictions, or logs that can help diagnose why authentication is failing from your application's server.

By systematically going through these, especially focusing on the `.env` file formatting and the accuracy of `SMTP_PASS`, you should be able to resolve the "Incorrect authentication data" error.