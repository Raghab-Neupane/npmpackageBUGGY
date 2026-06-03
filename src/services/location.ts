let cachedIp: string | null = null;

export async function getClientIp() {
    if (cachedIp) return cachedIp;

    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();

    cachedIp = data.ip;
    return cachedIp;
}