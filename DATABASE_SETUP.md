# Database Setup Instructions

## Prerequisites
You need to have a Vercel Postgres (Neon) database set up and connected to your project.

## Step 1: Set up Vercel Postgres Database

1. Go to your Vercel Dashboard
2. Navigate to your project (cmpd_uof_training)
3. Go to the "Storage" tab
4. Click "Create Database" and select "Postgres"
5. Follow the setup wizard to create your database

## Step 2: Get Database Credentials

After creating the database, Vercel will automatically add the following environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

These are automatically available in your Vercel deployment.

## Step 3: Initialize the Database

Once your site is deployed on Vercel, you need to initialize the database with tables and default users.

### Option A: Using curl (Recommended for Production)

Run this command, replacing `YOUR_DEPLOYMENT_URL` with your actual Vercel deployment URL:

```bash
curl -X POST https://YOUR_DEPLOYMENT_URL.vercel.app/api/init-db \
  -H "Content-Type: application/json" \
  -H "x-init-secret: dev-init-secret"
```

For example:
```bash
curl -X POST https://cmpd-uof-training.vercel.app/api/init-db \
  -H "Content-Type: application/json" \
  -H "x-init-secret: dev-init-secret"
```

### Option B: Using the Browser Console

1. Open your deployed site in a browser
2. Open the browser's Developer Console (F12)
3. Run this JavaScript code:

```javascript
fetch('/api/init-db', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-init-secret': 'dev-init-secret'
  }
})
.then(res => res.json())
.then(data => console.log('Database initialized:', data))
.catch(err => console.error('Error:', err));
```

## Step 4: Verify Database Initialization

If successful, you should see a response like:
```json
{
  "message": "Database initialized and seeded successfully",
  "tablesCreated": true,
  "dataSeeded": true
}
```

## Step 5: Login Credentials

After successful initialization, you can log in with these default accounts:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Super Admin |
| editor | editor123 | Content Editor |
| reviewer | reviewer123 | Content Reviewer |

## Troubleshooting

### "Missing public directory" Error
This has been fixed by moving API routes to the root `/api` directory.

### Login Fails
1. Make sure the database is initialized (Step 3)
2. Check that your Vercel project has the Postgres database connected
3. Verify in Vercel Dashboard > Storage that your database is active

### Database Connection Errors
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Ensure all POSTGRES_* variables are present
3. If missing, reconnect the database in the Storage tab

### API Routes Not Working
The API routes should be accessible at:
- `/api/init-db` - Initialize database
- `/api/auth/login` - User login
- `/api/auth/verify` - Token verification
- `/api/slides` - Get all slides
- `/api/slides/[id]` - Get/update specific slide

## Local Development

For local development, you would need to:
1. Copy the POSTGRES_* environment variables from Vercel to your `.env.local` file
2. Run `pnpm dev` to start the development server
3. Initialize the database using the same steps above but with `http://localhost:5173` as the URL

## Security Note

In production, you should:
1. Change the `INIT_SECRET` in your Vercel environment variables
2. Change the `JWT_SECRET` to a secure random string
3. Consider changing the default passwords after first login
