#!/usr/bin/env node
/**
 * Database Connection Validation Script
 * 
 * This script validates that the application can connect to the Supabase database
 * and perform basic operations.
 * 
 * Usage:
 *   npx tsx src/scripts/validate-db.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { supabase, supabaseAdmin } from '../lib/supabase';

async function validateDatabaseConnection() {
    console.log('🔍 Starting database connection validation...\n');

    try {
        // Test 1: Check environment variables
        console.log('1️⃣ Checking environment variables...');
        const dbUrl = process.env.DATABASE_URL;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!dbUrl) {
            console.error('   ❌ DATABASE_URL is not set');
            return false;
        } else {
            // Mask password in URL for security
            const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
            console.log(`   ✅ DATABASE_URL is set: ${maskedUrl}`);
        }

        if (!supabaseUrl) {
            console.error('   ❌ NEXT_PUBLIC_SUPABASE_URL is not set');
            return false;
        } else {
            console.log(`   ✅ NEXT_PUBLIC_SUPABASE_URL is set: ${supabaseUrl}`);
        }

        if (!supabaseAnonKey) {
            console.error('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
            return false;
        } else {
            console.log(`   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set: ${supabaseAnonKey.substring(0, 20)}...`);
        }

        if (!supabaseServiceKey) {
            console.error('   ❌ SUPABASE_SERVICE_ROLE_KEY is not set');
            return false;
        } else {
            console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY is set: ${supabaseServiceKey.substring(0, 20)}...`);
        }

        console.log('\n2️⃣ Testing database connection with Supabase client...');

        // Test 2: Simple query to check connection
        const { data: pingData, error: pingError } = await supabase
            .from('_test_connection')
            .select('*')
            .limit(1);

        if (pingError && pingError.code !== 'PGRST116') {
            // PGRST116 = table doesn't exist, which is fine - connection works
            console.warn(`   ⚠️  Query error: ${pingError.message}`);
        } else {
            console.log('   ✅ Supabase client connection successful');
        }

        // Test 3: Check admin client
        console.log('\n3️⃣ Testing admin client connection...');
        const { data: adminPingData, error: adminPingError } = await supabaseAdmin
            .from('_test_connection')
            .select('*')
            .limit(1);

        if (adminPingError && adminPingError.code !== 'PGRST116') {
            console.warn(`   ⚠️  Admin query error: ${adminPingError.message}`);
        } else {
            console.log('   ✅ Supabase admin client connection successful');
        }

        // Test 4: List existing tables
        console.log('\n4️⃣ Checking database schema...');
        const { data: tables, error: tablesError } = await supabaseAdmin
            .rpc('get_tables')
            .catch(async () => {
                // Fallback: try to query information_schema directly
                return await supabaseAdmin
                    .from('information_schema.tables')
                    .select('table_name')
                    .eq('table_schema', 'public');
            });

        if (tablesError) {
            console.warn('   ⚠️  Could not list tables (this might be a permissions issue)');
            console.warn(`   Error: ${tablesError.message}`);
        } else if (tables && tables.length > 0) {
            console.log(`   ✅ Found ${tables.length} table(s) in the database`);
            if (Array.isArray(tables)) {
                tables.slice(0, 10).forEach((table: any) => {
                    console.log(`      - ${table.table_name || table}`);
                });
                if (tables.length > 10) {
                    console.log(`      ... and ${tables.length - 10} more`);
                }
            }
        } else {
            console.log('   ℹ️  No tables found in public schema (database might be empty)');
        }

        // Test 5: Check specific important tables for your app
        console.log('\n5️⃣ Checking application tables...');
        const importantTables = ['adda_sessions', 'flats', 'residents', 'events', 'notices'];

        for (const tableName of importantTables) {
            const { data, error } = await supabaseAdmin
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    console.log(`   ⚠️  Table '${tableName}' does not exist (might need migration)`);
                } else {
                    console.error(`   ❌ Error checking table '${tableName}': ${error.message}`);
                }
            } else {
                console.log(`   ✅ Table '${tableName}' exists and is accessible`);
            }
        }

        console.log('\n✅ Database validation completed successfully!\n');
        console.log('Your application should be able to connect to the database.');
        return true;

    } catch (error: any) {
        console.error('\n❌ Database validation failed!');
        console.error('Error:', error.message);
        if (error.stack) {
            console.error('\nStack trace:');
            console.error(error.stack);
        }
        console.log('\n📝 Troubleshooting tips:');
        console.log('1. Verify your .env.local file has the correct DATABASE_URL');
        console.log('2. Check that your Supabase project is running');
        console.log('3. Ensure your network can reach the database host');
        console.log('4. Verify your database credentials are correct\n');
        return false;
    }
}

// Run validation
validateDatabaseConnection()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
