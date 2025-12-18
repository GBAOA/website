
import { getAddaSession } from './adda-auth';


export interface AddaResident {
    id: string;
    name: string;
    flat: string;
    email: string;
    phone: string;
    type: 'Owner' | 'Tenant';
}

export interface AddaFlat {
    id: string;
    block: string;
    number: string;
}

export class AddaClient {
    private baseUrl = 'https://www.adda.io';

    private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const session = await getAddaSession();

        // Construct Cookie header
        const cookieHeader = session.cookies.map(c => `${c.name}=${c.value}`).join('; ');

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...session.headers,
                'Cookie': cookieHeader,
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest', // Critical for PHP AJAX checks
                ...options.headers,
            }
        });

        if (res.status === 401 || res.status === 403) {
            console.log('AddaClient: Session expired or invalid. Retrying with fresh login...');
            // Invalidate cache and retry once
            const newSession = await getAddaSession(true);
            const newCookieHeader = newSession.cookies.map(c => `${c.name}=${c.value}`).join('; ');

            return fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...newSession.headers,
                    'Cookie': newCookieHeader,
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...options.headers,
                }
            });
        }

        return res;
    }

    // NOTE: These endpoints are inferred/assumed based on the prompt description.
    // In a real scenario, we would have scraped the network logs in Phase 1 to find the exact URLs.
    // Since we couldn't interact with the live dashboard, we will implement the Client shell.
    // If these 404, we will need to debug by logging the actual dashboard HTML in a future step.

    async getResidents(): Promise<AddaResident[]> {
        // Hypothetical endpoint based on prompt: ajax_admin_residents_flats_members.php
        // We might need to adjust this path.
        const response = await this.fetchWithAuth('/ajax_admin_residents_flats_members.php');

        if (!response.ok) {
            throw new Error(`Failed to fetch residents: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Assuming data structure normalization is needed here
        // This part is highly speculative without seeing real response.
        // We return 'data' casted for now.
        return data as AddaResident[];
    }

    async getFlats(): Promise<AddaFlat[]> {
        // Hypothetical endpoint: ajax_fetch_apt_flats.php
        const response = await this.fetchWithAuth('/ajax_fetch_apt_flats.php');

        if (!response.ok) {
            throw new Error(`Failed to fetch flats: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data as AddaFlat[];
    }
}
