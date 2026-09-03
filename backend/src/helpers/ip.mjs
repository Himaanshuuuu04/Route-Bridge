import axios from 'axios';

export function getClientIp(req) {
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const trueClientIp = req.headers['true-client-ip'];
    const xRealIp = req.headers['x-real-ip'];
    const xForwardedFor = req.headers['x-forwarded-for'];
    const reqIp = req.ip;
    const remoteAddress = req.socket?.remoteAddress;

    console.log(`[IP Extraction Debug] Headers:`, {
        'cf-connecting-ip': cfConnectingIp,
        'true-client-ip': trueClientIp,
        'cf-ipcountry': req.headers['cf-ipcountry'],
        'x-real-ip': xRealIp,
        'x-forwarded-for': xForwardedFor,
        'req.ip': reqIp,
        'remoteAddress': remoteAddress
    });

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

    console.log(`[IP Extraction Debug] Selected Client IP: "${resolvedIp}"`);
    return resolvedIp.trim();
}

export async function getCountryFromRequest(req) {
    const ip = getClientIp(req);

    // If behind Cloudflare, cf-ipcountry is provided directly by Cloudflare edge
    const cfCountry = req.headers['cf-ipcountry'];
    if (cfCountry && typeof cfCountry === 'string' && cfCountry.length === 2 && cfCountry !== 'XX' && cfCountry !== 'T1') {
        const countryCode = cfCountry.trim().toUpperCase();
        console.log(`[GeoIP Debug] Using Cloudflare cf-ipcountry header: "${countryCode}" for IP "${ip}"`);
        return {
            country: countryCode,
            countryCode: countryCode,
            source: 'cloudflare'
        };
    }

    return await getCountryFromIp(ip);
}

export async function getCountryFromIp(ip) {
    console.log(`[GeoIP Debug] Incoming IP: "${ip}"`);

    // Clean IP if it is an IPv4-mapped IPv6 address
    let cleanIp = ip || '';
    if (cleanIp.startsWith('::ffff:')) {
        cleanIp = cleanIp.substring(7);
    }

    if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
        console.log(`[GeoIP Debug] Localhost/loopback IP detected: "${cleanIp}". Returning LCL.`);
        return { country: 'Local', countryCode: 'LCL' };
    }
    
    // If it's a private IP address range (10.x.x.x, 172.16.x.x to 172.31.x.x, 192.168.x.x)
    if (
        cleanIp.startsWith('10.') ||
        cleanIp.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanIp)
    ) {
        console.log(`[GeoIP Debug] Private IP range detected: "${cleanIp}". Returning LCL.`);
        return { country: 'Private IP', countryCode: 'LCL' };
    }
    
    try {
        const url = `http://ip-api.com/json/${cleanIp}`;
        console.log(`[GeoIP Debug] Querying ip-api.com: ${url}`);

        // Fetch geo data from ip-api.com with 2 seconds timeout
        const response = await axios.get(url, { timeout: 2000 });
        console.log(`[GeoIP Debug] ip-api.com HTTP Status: ${response.status}`);
        console.log(`[GeoIP Debug] ip-api.com Response Data:`, JSON.stringify(response.data));

        if (response.data && response.data.status === 'success') {
            const result = {
                country: response.data.country || 'Unknown',
                countryCode: response.data.countryCode || 'UN'
            };
            console.log(`[GeoIP Debug] Resolved Geo:`, result);
            return result;
        } else {
            console.warn(`[GeoIP Debug] ip-api.com returned non-success:`, response.data);
        }
    } catch (err) {
        console.error(`[GeoIP Debug] Error resolving country for IP ${cleanIp}:`, {
            message: err.message,
            code: err.code,
            httpStatus: err.response?.status,
            responseData: err.response?.data
        });
    }
    console.log(`[GeoIP Debug] Falling back to Unknown (UN) for IP: "${cleanIp}"`);
    return { country: 'Unknown', countryCode: 'UN' };
}
