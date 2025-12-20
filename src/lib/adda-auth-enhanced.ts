import puppeteer, { Browser, Page, HTTPRequest, HTTPResponse } from 'puppeteer';

export interface NetworkRequest {
    url: string;
    method: string;
    headers: Record<string, string>;
    postData?: string;
    response?: {
        status: number;
        statusText: string;
        headers: Record<string, string>;
        body?: string;
    };
    type: string;
    timestamp: number;
}

export interface CapturedSession {
    cookies: any[];
    headers: Record<string, string>;
    networkRequests: NetworkRequest[];
    endpoints: {
        ajax: string[];
        api: string[];
        other: string[];
    };
    tokens: Record<string, string>;
    lastUpdated: number;
}

let capturedSession: CapturedSession | null = null;
const SESSION_EXPIRY_MS = 1000 * 60 * 15; // 15 minutes

export async function performAddaLoginWithCapture(forceRefresh = false): Promise<CapturedSession> {
    if (
        !forceRefresh &&
        capturedSession &&
        Date.now() - capturedSession.lastUpdated < SESSION_EXPIRY_MS
    ) {
        console.log('[AddaAuth] Returning cached captured session');
        return capturedSession;
    }

    console.log('[AddaAuth] Starting login flow with network capture...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const networkRequests: NetworkRequest[] = [];
    const capturedEndpoints = {
        ajax: [] as string[],
        api: [] as string[],
        other: [] as string[]
    };
    const tokens: Record<string, string> = {};

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        // Capture all network requests
        page.on('request', (request: HTTPRequest) => {
            const url = request.url();
            const method = request.method();
            const headers = request.headers();
            const postData = request.postData();
            const type = request.resourceType();

            const req: NetworkRequest = {
                url,
                method,
                headers: { ...headers },
                postData,
                type,
                timestamp: Date.now()
            };

            networkRequests.push(req);

            // Categorize endpoints
            if (url.includes('ajax') || url.includes('.php')) {
                if (url.includes('ajax_')) {
                    capturedEndpoints.ajax.push(url);
                } else {
                    capturedEndpoints.api.push(url);
                }
            } else if (!url.includes('adda.io') || url.includes('/api/') || url.includes('/ajax/')) {
                capturedEndpoints.other.push(url);
            }

            // Extract tokens from headers
            if (headers['authorization']) {
                tokens['authorization'] = headers['authorization'];
            }
            if (headers['x-csrf-token']) {
                tokens['csrf-token'] = headers['x-csrf-token'];
            }
            if (headers['x-auth-token']) {
                tokens['auth-token'] = headers['x-auth-token'];
            }

            // Extract tokens from postData
            if (postData) {
                try {
                    const data = JSON.parse(postData);
                    Object.keys(data).forEach(key => {
                        if (key.toLowerCase().includes('token') || key.toLowerCase().includes('csrf')) {
                            tokens[key] = String(data[key]);
                        }
                    });
                } catch (e) {
                    // Try URL-encoded format
                    if (postData.includes('token=') || postData.includes('csrf=')) {
                        const params = new URLSearchParams(postData);
                        params.forEach((value, key) => {
                            if (key.toLowerCase().includes('token') || key.toLowerCase().includes('csrf')) {
                                tokens[key] = value;
                            }
                        });
                    }
                }
            }
        });

        // Capture responses
        page.on('response', async (response: HTTPResponse) => {
            const url = response.url();
            const status = response.status();
            const statusText = response.statusText();
            const headers = response.headers();

            // Find matching request
            const reqIndex = networkRequests.findIndex(r => r.url === url && !r.response);
            if (reqIndex >= 0) {
                try {
                    let body: string | undefined;
                    const contentType = headers['content-type'] || '';
                    if (contentType.includes('application/json') || contentType.includes('text/')) {
                        try {
                            body = await response.text();
                        } catch (e) {
                            // Ignore if can't read body
                        }
                    }

                    networkRequests[reqIndex].response = {
                        status,
                        statusText,
                        headers: { ...headers },
                        body
                    };

                    // Extract tokens from response headers
                    if (headers['x-csrf-token']) {
                        tokens['csrf-token'] = headers['x-csrf-token'];
                    }
                    if (headers['set-cookie']) {
                        const cookies = Array.isArray(headers['set-cookie']) 
                            ? headers['set-cookie'] 
                            : [headers['set-cookie']];
                        cookies.forEach(cookie => {
                            if (cookie.includes('token=') || cookie.includes('csrf=')) {
                                const match = cookie.match(/(token|csrf)=([^;]+)/i);
                                if (match) {
                                    tokens[match[1].toLowerCase()] = match[2];
                                }
                            }
                        });
                    }

                    // Extract tokens from response body
                    if (body) {
                        try {
                            const data = JSON.parse(body);
                            Object.keys(data).forEach(key => {
                                if (key.toLowerCase().includes('token') || key.toLowerCase().includes('csrf')) {
                                    tokens[key] = String(data[key]);
                                }
                            });
                        } catch (e) {
                            // Not JSON, ignore
                        }
                    }
                } catch (e) {
                    console.warn(`[AddaAuth] Failed to capture response for ${url}:`, e);
                }
            }
        });

        // Navigate to login page
        console.log('[AddaAuth] Navigating to https://www.adda.io/login ...');
        await page.goto('https://www.adda.io/login', {
            waitUntil: 'networkidle2',
            timeout: 45000,
        });

        // Handle cookie banner
        try {
            const acceptBtn = await page.$('#acceptbutton');
            if (acceptBtn) {
                await acceptBtn.click();
                await new Promise((r) => setTimeout(r, 1000));
            }
        } catch (e) {
            console.log('[AddaAuth] No cookie banner found');
        }

        // Find login form
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
                    await new Promise(r => setTimeout(r, 3000));
                } else {
                    console.log('[AddaAuth] Sign In button not found. Forcing navigation to /login_auth');
                    await page.goto('https://www.adda.io/login_auth', { waitUntil: 'networkidle2', timeout: 30000 });
                }
            } catch (e) {
                console.warn('[AddaAuth] Error during navigation interaction: ', e);
            }
        }

        // Check again for password field
        passwordField = await page.$('input[type="password"]');
        if (!passwordField) {
            throw new Error('Could not find password field even after navigation attempts.');
        }

        // Input credentials
        console.log('[AddaAuth] Inputting credentials...');

        if (!process.env.ADDA_EMAIL || !process.env.ADDA_PASSWORD) {
            throw new Error('ADDA_EMAIL or ADDA_PASSWORD not set in environment.');
        }

        await page.type('input[type="email"]', process.env.ADDA_EMAIL);
        await page.type('input[type="password"]', process.env.ADDA_PASSWORD);

        // Submit form
        await page.keyboard.press('Enter');

        console.log('[AddaAuth] Submitted form. Waiting for navigation...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

        // Wait a bit more to capture any post-login requests
        await new Promise(r => setTimeout(r, 3000));

        // Verify login
        const cookies = await page.cookies();
        const phpsessid = cookies.find(c => c.name === 'PHPSESSID');

        if (!phpsessid) {
            const passwordStillThere = await page.$('input[type="password"]');
            if (passwordStillThere) {
                throw new Error('Login failed. Password field still visible. Check credentials.');
            }
            console.warn('[AddaAuth] WARNING: PHPSESSID not found explicitly, but navigation occurred.');
        }

        console.log(`[AddaAuth] Login successful. Cookies: ${cookies.length}, Network requests captured: ${networkRequests.length}`);

        // Extract common headers from the last successful request
        const lastRequest = networkRequests[networkRequests.length - 1];
        const commonHeaders: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
        };

        // Add referrer and origin from last request if available
        if (lastRequest?.headers['referer']) {
            commonHeaders['Referer'] = lastRequest.headers['referer'];
        }
        if (lastRequest?.headers['origin']) {
            commonHeaders['Origin'] = lastRequest.headers['origin'];
        }

        // Add any captured tokens to headers
        Object.keys(tokens).forEach(key => {
            const headerKey = `X-${key.replace(/-/g, '-').toUpperCase()}`;
            commonHeaders[headerKey] = tokens[key];
        });

        capturedSession = {
            cookies,
            headers: commonHeaders,
            networkRequests,
            endpoints: capturedEndpoints,
            tokens,
            lastUpdated: Date.now()
        };

        return capturedSession;

    } catch (error) {
        console.error('[AddaAuth] Login Failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

