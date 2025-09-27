# Deployment and Database Initialization Instructions

## 1. Verify INIT_SECRET in Vercel Production Environment

Before initializing the database, you need to verify that the `INIT_SECRET` environment variable is set in the Vercel production environment:

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the "neon-oof-training" project
3. Go to the "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Verify that `INIT_SECRET` is set in the Production environment
   - If it's not set, add it with a secure random string value
   - Make note of this value as you'll need it for the database initialization step

## 2. Initialize the Production Database

After the code changes have been deployed to production and you've verified the `INIT_SECRET` is set, you can initialize the database with the following steps:

1. Wait for the Vercel deployment to complete (this should happen automatically after the GitHub push)
2. Run the following curl command to initialize the database (replace `YOUR_INIT_SECRET` with the actual value):

```bash
curl -X POST https://cmpd-uof-training.vercel.app/api/init-db \
  -H "Content-Type: application/json" \
  -H "x-init-secret: YOUR_INIT_SECRET"
```

3. You should receive a response like this if successful:
```json
{
  "message": "Database initialized and seeded successfully",
  "tablesCreated": true,
  "dataSeeded": true
}
```

## 3. Verify Database Initialization

To verify that the database has been properly initialized, you can check the Neon PostgreSQL dashboard:

1. Log in to your [Neon Dashboard](https://console.neon.tech/)
2. Select your project
3. Go to the SQL Editor
4. Run the following queries to verify the database structure and content:

```sql
-- Check tables in the public schema
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check slide count
SELECT COUNT(*) FROM slides;

-- Check most recent update timestamp
SELECT MAX(updated_at) FROM slides;

-- Check audit logs
SELECT COUNT(*) FROM audit_logs;
```

## 4. Test the Application

After initializing the database, test the application to ensure that slide changes are now being persisted:

1. Log in to the admin interface at https://cmpd-uof-training.vercel.app/
   - Username: admin
   - Password: admin123
2. Make changes to slides (add images, modify content)
3. Save the changes and verify they appear correctly
4. Log out completely
5. Log back in and verify your changes are still present
6. Navigate between slides to ensure all changes were properly persisted

## Troubleshooting

If you encounter any issues:

1. Check the Vercel deployment logs for any errors
2. Verify that all environment variables are correctly set
3. Check the Neon PostgreSQL connection status
4. Ensure that the database tables were created successfully
5. Check the browser console for any JavaScript errors

If the database initialization fails, you can try running the initialization command again. If it continues to fail, check the Vercel logs for more detailed error information.