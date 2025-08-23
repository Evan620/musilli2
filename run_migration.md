# Database Migration Instructions

## Step 1: Run the User Management Migration

Go to your **Supabase Dashboard → SQL Editor** and run the migration file:

```sql
-- Copy and paste the entire content from:
-- supabase/migrations/004_user_management_enhancement.sql
```

This migration will:
- ✅ Add user management fields to profiles table
- ✅ Create admin_activity_logs table
- ✅ Create system_notifications table
- ✅ Add helper functions for user management
- ✅ Set up proper permissions and RLS policies

## Step 2: Verify Migration Success

After running the migration, verify it worked by running these queries:

```sql
-- Check if new columns were added to profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('last_login_at', 'login_count', 'suspension_reason');

-- Check if new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_activity_logs', 'system_notifications');

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('suspend_user', 'activate_user', 'soft_delete_user');
```

## Step 3: Test the Implementation

Once the migration is complete, the admin dashboard will:
- ✅ Load real users from the database
- ✅ Support user search functionality
- ✅ Allow suspending/activating users with reasons
- ✅ Track all admin actions in activity logs
- ✅ Show real-time notifications

## Expected Results

After migration, you should see:
1. **Real user data** instead of mock data in the Users tab
2. **Working search** functionality
3. **Functional user actions** (suspend, activate, delete)
4. **Activity logging** for all admin actions
5. **System notifications** for admin events

## Troubleshooting

If you encounter any issues:

1. **Permission errors**: Make sure you're running the SQL as a superuser
2. **Column already exists**: Some columns might already exist, that's okay
3. **Function errors**: Check that all required extensions are enabled

Run this to check for any errors:
```sql
SELECT * FROM system_notifications ORDER BY created_at DESC LIMIT 5;
```

You should see a notification about the user management system being enabled.
