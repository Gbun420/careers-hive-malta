# JBoard Parity Feature Set - How to Run Locally

This document outlines the steps to run and test the new JBoard parity features (XML Importer, Alerts, Profiles, ATS).

## Prerequisites

1.  **Supabase**: Ensure your local Supabase instance is running (`supabase start`) or you are connected to a remote project.
2.  **Migrations**: Run the new migration.
    ```bash
    supabase db push # or paste contents of supabase/migrations/0015_jboard_parity.sql into SQL editor
    ```

## 1. XML Importer

1.  **Configure Source**:
    Insert a row into `job_sources`:
    ```sql
    INSERT INTO job_sources (name, type, feed_url, mapping) VALUES (
      'Test Feed',
      'XML',
      'https://example.com/feed.xml', -- Replace with valid XML feed
      '{"rootPath": "jobs.job", "fields": {"external_id": "id", "title": "title", "description": "description", "company_name": "company"}}'
    );
    ```
2.  **Run Cron**:
    Send a GET request to the cron route with your secret:
    ```bash
    curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/import-jobs
    ```
3.  **Verify**: Check `jobs` table for new entries and `job_import_runs` for logs.

## 2. Job Alerts

1.  **Create Alert**:
    Log in as a jobseeker and use the frontend to save a search, or insert directly into `job_alerts`.
2.  **Trigger Cron**:
    ```bash
    curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/send-alerts
    ```
3.  **Verify**: Check logs for email sending (or console output if mailer is in dev mode).

## 3. Profiles & Moderation

1.  **Create Profile**: User logs in and fills profile (ensure `status` defaults to `PENDING`).
2.  **Admin Review**:
    Log in as Admin (role='admin').
    Navigate to `/admin/profiles`.
    Click "Approve" or "Reject".
3.  **Verify**: Profile status changes in DB.

## 4. Employer Dashboard (ATS)

1.  **View Applications**:
    Log in as Employer.
    Navigate to your dashboard or check `/api/employer/applications?jobId=YOUR_JOB_ID`.
    Ensure you can see applicants.

## 5. SEO

1.  **Sitemap**: Visit `http://localhost:3000/sitemap.xml`.
2.  **Structured Data**: Inspect a job detail page source for `<script type="application/ld+json">`.

## Environment Variables

Ensure these are set in `.env.local`:
- `CRON_SECRET`: Secret key for cron jobs.
- `PUBLIC_METRICS_ENABLED`: "true" or "false".
- `GOOGLE_INDEXING_ENABLED`: "true" or "false".
- `URL_IMPORTER_ENABLED`: "true" or "false".
- `RESEND_API_KEY`: For emails.
