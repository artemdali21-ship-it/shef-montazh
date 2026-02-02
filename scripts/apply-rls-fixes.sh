#!/bin/bash

# Script to apply RLS fixes to Supabase
# This script updates the RLS policies to fix profile update errors

echo "Applying RLS fixes..."
echo "This script requires Supabase CLI to be installed"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Apply migrations
echo "Running migrations..."
supabase migration up

if [ $? -eq 0 ]; then
    echo "✓ Migrations applied successfully!"
    echo ""
    echo "Changes applied:"
    echo "1. Fixed worker_profiles UPDATE RLS policy - removed field comparison check"
    echo "2. Fixed client_profiles UPDATE RLS policy - removed field comparison check"
    echo "3. Updated users UPDATE RLS policy - now allows users to update their own data"
    echo ""
    echo "The profile photo upload should now work correctly!"
else
    echo "✗ Error applying migrations"
    exit 1
fi
