# Redeemer Google Sheets setup

1. Import `Redeemer_Intake_and_Analytics.xlsx` into Google Drive as a native Google Sheet.
2. Open the Sheet and choose **Extensions → Apps Script**.
3. Replace the editor contents with `Code.gs`, then save.
4. Choose **Deploy → New deployment → Web app**.
5. Execute as **Me** and allow access to **Anyone** so public website forms can submit without requiring a Google login.
6. Copy the deployment URL ending in `/exec`.
7. Paste that URL into `googleSheetsWebAppUrl` in `assets/js/config.js`.
8. Submit one test form and visit several website pages. Confirm rows appear in **Master Intake**, the appropriate form tab, and **Analytics Events**.

Security notes:

- Do not place confidential pastoral details in analytics metadata.
- Limit Sheet sharing to authorized church staff.
- Review access, retention, and deletion procedures regularly.
- Redeploy the Apps Script after changing `Code.gs`.
