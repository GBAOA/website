
import puppeteer, { Browser, Page } from 'puppeteer';

interface AddaSession {
    cookies: any[];
    headers: Record<string, string>;
    lastUpdated: number;
}

let cachedSession: AddaSession | null = null;
const SESSION_EXPIRY_MS = 1000 * 60 * 15; // 15 minutes

export async function getAddaSession(forceRefresh = false): Promise<AddaSession> {
    if (
        !forceRefresh &&
        cachedSession &&
        Date.now() - cachedSession.lastUpdated < SESSION_EXPIRY_MS
    ) {
        console.log('[AddaAuth] Returning cached session');
        return cachedSession;
    }

    console.log('[AddaAuth] Starting new login flow...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        // Use a standard UA to avoid blocking
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        // 1. Navigate to Login
        // Based on research, /login sometimes defaults to Sign Up. 
        // We try to go directly to what might be the auth page, or navigate via UI.
        // The most robust way found was checking for "Sign In" button.

        console.log('[AddaAuth] Navigating to https://www.adda.io/login ...');
        await page.goto('https://www.adda.io/login', {
            waitUntil: 'networkidle2',
            timeout: 45000,
        });

        // 2. Handle Cookie Banner
        try {
            const acceptBtn = await page.$('#acceptbutton');
            if (acceptBtn) {
                await acceptBtn.click();
                await new Promise((r) => setTimeout(r, 1000));
            }
        } catch (e) { /* ignore */ }

        // 3. Find Login Form
        // If we don't see a password field, we likely need to click "Sign In"
        let passwordField = await page.$('input[type="password"]');
        if (!passwordField) {
            console.log('[AddaAuth] No password field found. Searching for Sign In button...');
            try {
                const signInBtnHandle = await page.evaluateHandle(() => {
                    const btns = Array.from(document.querySelectorAll('button, a'));
                    return btns.find(b => {
                        const el = b as HTMLElement;
                        return ['sign in', 'login', 'log in'].includes((el.innerText || '').trim().toLowerCase());
                    });
                });

                const signInBtn = signInBtnHandle.asElement();
                if (signInBtn) {
                    await (signInBtn as any).click();
                    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => { });
                    // Wait a bit for modal or dynamic load
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    // Fallback: Force navigate to login_auth
                    console.log('[AddaAuth] Sign In button not found. Forcing navigation to /login_auth');
                    await page.goto('https://www.adda.io/login_auth', { waitUntil: 'networkidle2', timeout: 30000 });
                }
            } catch (e) {
                console.warn('[AddaAuth] Error during navigation interaction: ', e);
            }
        }

        // Check again for password
        passwordField = await page.$('input[type="password"]');
        if (!passwordField) {
            throw new Error('Could not find password field even after navigation attempts.');
        }

        // 4. Input Credentials
        // We need to identify specific fields. 
        // Investigation showed: email [email], password [current-password/password] usually.
        // We'll trust that typical selectors work or search by type.

        console.log('[AddaAuth] Inputting credentials...');

        // DEBUG: Check environment variables
        console.log('[AddaAuth] Debug Env Vars:', {
            ADDA_EMAIL_EXISTS: !!process.env.ADDA_EMAIL,
            ADDA_PASSWORD_EXISTS: !!process.env.ADDA_PASSWORD,
            EMAIL_LENGTH: process.env.ADDA_EMAIL ? process.env.ADDA_EMAIL.length : 0,
            NODE_ENV: process.env.NODE_ENV
        });

        if (!process.env.ADDA_EMAIL || !process.env.ADDA_PASSWORD) {
            throw new Error('ADDA_EMAIL or ADDA_PASSWORD not set in environment.');
        }

        // Fill Email
        await page.type('input[type="email"]', process.env.ADDA_EMAIL);
        // Fill Password
        await page.type('input[type="password"]', process.env.ADDA_PASSWORD);

        // 5. Submit
        // Look for a submit button or just press Enter
        await page.keyboard.press('Enter');

        console.log('[AddaAuth] Submitted form. Waiting for navigation...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

        // 6. Verify Login & Extract Details
        const cookies = await page.cookies();
        const phpsessid = cookies.find(c => c.name === 'PHPSESSID');

        if (!phpsessid) {
            // Double check if we are still on login page (failure)
            const passwordStillThere = await page.$('input[type="password"]');
            if (passwordStillThere) {
                throw new Error('Login failed. Password field still visible. Check credentials.');
            }
            console.warn('[AddaAuth] WARNING: PHPSESSID not found explicitly, but navigation occurred.');
        }

        console.log(`[AddaAuth] Login successful. Cookies found: ${cookies.length}`);

        cachedSession = {
            cookies,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                // Add other headers if found (CSRF?)
            },
            lastUpdated: Date.now()
        };

        return cachedSession;

    } catch (error) {
        console.error('[AddaAuth] Login Failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}
