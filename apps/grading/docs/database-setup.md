# Database Setup for Production

## PostgreSQL Connection String

When using Supabase or other PostgreSQL providers with connection pooling, you may encounter the error:
```
prepared statement "s1" already exists
```

To fix this, add the following parameters to your DATABASE_URL:

### For Supabase:
```
DATABASE_URL="postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true&statement_cache_size=0&connection_limit=1"
```

### For other providers:
```
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?statement_cache_size=0"
```

### Important Parameters:
- `pgbouncer=true` - Required for Supabase pooler connections
- `statement_cache_size=0` - Disables prepared statement caching
- `connection_limit=1` - Limits concurrent connections to prevent pooling issues

## Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Update DATABASE_URL with the pgbouncer parameter
4. Redeploy your application

## Additional Notes

- The `pgbouncer=true` parameter is required when using Supabase's connection pooler
- The `statement_cache_size=0` disables prepared statements which can cause issues with connection pooling
- Always use the pooler connection string (port 6543) for serverless environments
- If errors persist, the Prisma client in `src/lib/prisma.ts` automatically adds these parameters
- The API routes include retry logic with connection reset for handling persistent prepared statement errors