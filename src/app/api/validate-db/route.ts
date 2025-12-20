import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * Database Connection Validation API Endpoint
 * 
 * This endpoint validates that the application can connect to Supabase
 * and perform basic database operations.
 * 
 * Usage:
 *   Visit: http://localhost:3000/api/validate-db
 *   Or: curl http://localhost:3000/api/validate-db
 */
export async function GET() {
    const results = {
        timestamp: new Date().toISOString(),
        environment: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
        },
        tests: [] as any[],
        success: true,
        errors: [] as string[],
    };

    try {
        // Test 1: Check environment variables
        results.tests.push({
            name: 'Environment Variables Check',
            status: 'running',
        });

        if (!process.env.DATABASE_URL) {
            results.errors.push('DATABASE_URL is not set');
            results.success = false;
        }
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            results.errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
            results.success = false;
        }
        if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            results.errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
            results.success = false;
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            results.errors.push('SUPABASE_SERVICE_ROLE_KEY is not set');
            results.success = false;
        }

        results.tests[results.tests.length - 1].status = results.errors.length === 0 ? 'passed' : 'failed';
        results.tests[results.tests.length - 1].errors = [...results.errors];

        if (results.errors.length > 0) {
            return NextResponse.json(results, { status: 500 });
        }

        // Test 2: Test client connection
        results.tests.push({
            name: 'Supabase Client Connection',
            status: 'running',
        });

        try {
            const { data, error } = await supabase
                .from('adda_sessions')
                .select('id')
                .limit(1);

            if (error) {
                if (error.code === 'PGRST116') {
                    // Table doesn't exist - still means connection works
                    results.tests[results.tests.length - 1].status = 'passed';
                    results.tests[results.tests.length - 1].note = 'Connection works but table does not exist yet';
                } else {
                    results.tests[results.tests.length - 1].status = 'failed';
                    results.tests[results.tests.length - 1].error = error.message;
                    results.errors.push(`Client connection error: ${error.message}`);
                    results.success = false;
                }
            } else {
                results.tests[results.tests.length - 1].status = 'passed';
                results.tests[results.tests.length - 1].recordCount = data?.length || 0;
            }
        } catch (e: any) {
            results.tests[results.tests.length - 1].status = 'failed';
            results.tests[results.tests.length - 1].error = e.message;
            results.errors.push(`Client connection exception: ${e.message}`);
            results.success = false;
        }

        // Test 3: Test admin connection
        results.tests.push({
            name: 'Supabase Admin Connection',
            status: 'running',
        });

        try {
            const { data, error } = await supabaseAdmin
                .from('adda_sessions')
                .select('id')
                .limit(1);

            if (error) {
                if (error.code === 'PGRST116') {
                    results.tests[results.tests.length - 1].status = 'passed';
                    results.tests[results.tests.length - 1].note = 'Admin connection works but table does not exist yet';
                } else {
                    results.tests[results.tests.length - 1].status = 'failed';
                    results.tests[results.tests.length - 1].error = error.message;
                    results.errors.push(`Admin connection error: ${error.message}`);
                    results.success = false;
                }
            } else {
                results.tests[results.tests.length - 1].status = 'passed';
                results.tests[results.tests.length - 1].recordCount = data?.length || 0;
            }
        } catch (e: any) {
            results.tests[results.tests.length - 1].status = 'failed';
            results.tests[results.tests.length - 1].error = e.message;
            results.errors.push(`Admin connection exception: ${e.message}`);
            results.success = false;
        }

        // Test 4: Check important tables
        results.tests.push({
            name: 'Application Tables Check',
            status: 'running',
            tables: {},
        });

        const importantTables = ['adda_sessions', 'flats', 'residents', 'events', 'notices'];
        const tableResults: Record<string, any> = {};

        for (const tableName of importantTables) {
            try {
                const { count, error } = await supabaseAdmin
                    .from(tableName)
                    .select('*', { count: 'exact', head: true });

                if (error) {
                    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                        tableResults[tableName] = { exists: false, note: 'Table does not exist (needs migration)' };
                    } else {
                        tableResults[tableName] = { exists: 'unknown', error: error.message };
                    }
                } else {
                    tableResults[tableName] = { exists: true, recordCount: count };
                }
            } catch (e: any) {
                tableResults[tableName] = { exists: 'unknown', error: e.message };
            }
        }

        results.tests[results.tests.length - 1].status = 'passed';
        results.tests[results.tests.length - 1].tables = tableResults;

        return NextResponse.json(results, { status: results.success ? 200 : 500 });

    } catch (error: any) {
        results.success = false;
        results.errors.push(`Unexpected error: ${error.message}`);
        results.tests.push({
            name: 'Validation Process',
            status: 'failed',
            error: error.message,
            stack: error.stack,
        });

        return NextResponse.json(results, { status: 500 });
    }
}
