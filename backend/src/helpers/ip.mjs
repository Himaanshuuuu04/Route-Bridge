import axios from 'axios';

export async function getCountryFromIp(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
        return { country: 'Local', countryCode: 'LCL' };
    }
    
    // Clean IP if it is an IPv4-mapped IPv6 address
    let cleanIp = ip;
    if (cleanIp.startsWith('::ffff:')) {
        cleanIp = cleanIp.substring(7);
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
        // Fetch geo data from ip-api.com with 2 seconds timeout
        const response = await axios.get(`http://ip-api.com/json/${cleanIp}`, { timeout: 2000 });
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
