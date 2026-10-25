import axios from 'axios';

export function getClientIp(req) {
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const trueClientIp = req.headers['true-client-ip'];
    const xRealIp = req.headers['x-real-ip'];
    const xForwardedFor = req.headers['x-forwarded-for'];
    const reqIp = req.ip;
    const remoteAddress = req.socket?.remoteAddress;

    let resolvedIp = cfConnectingIp || trueClientIp || xRealIp;

    if (!resolvedIp && xForwardedFor) {
        resolvedIp = xForwardedFor.split(',')[0].trim();
    }

    if (!resolvedIp) {
        resolvedIp = reqIp || remoteAddress || '';
    }

    if (resolvedIp.startsWith('::ffff:')) {
        resolvedIp = resolvedIp.substring(7);
    }

    return resolvedIp.trim();
}

export async function getCountryFromRequest(req) {
    const ip = getClientIp(req);

    // If behind Cloudflare, cf-ipcountry is provided directly by Cloudflare edge
    const cfCountry = req.headers['cf-ipcountry'];
    if (cfCountry && typeof cfCountry === 'string' && cfCountry.length === 2 && cfCountry !== 'XX' && cfCountry !== 'T1') {
        const countryCode = cfCountry.trim().toUpperCase();
        return {
            country: countryCode,
            countryCode: countryCode,
            source: 'cloudflare'
        };
    }

    return await getCountryFromIp(ip);
}

export async function getCountryFromIp(ip) {
    // Clean IP if it is an IPv4-mapped IPv6 address
    let cleanIp = ip || '';
    if (cleanIp.startsWith('::ffff:')) {
        cleanIp = cleanIp.substring(7);
    }

    if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
        return { country: 'Local', countryCode: 'LCL' };
    }
    
    // If it's a private IP address range (10.x.x.x, 172.16.x.x to 172.31.x.x, 192.168.x.x)
    if (
        cleanIp.startsWith('10.') ||
        cleanIp.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp)
    ) {
        return { country: 'Private IP', countryCode: 'LCL' };
    }
    
    try {
        const url = `http://ip-api.com/json/${cleanIp}`;
        const response = await axios.get(url, { timeout: 2000 });

        if (response.data && response.data.status === 'success') {
            return {
                country: response.data.country || 'Unknown',
                countryCode: response.data.countryCode || 'UN'
            };
        }
    } catch (err) {
        console.error(`Error resolving country for IP ${cleanIp}:`, err.message);
    }
    return { country: 'Unknown', countryCode: 'UN' };
}
