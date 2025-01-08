export function integerToIp(ipInteger: number): string {
    const bytes: number[] = new Array(4);
    bytes[0] = ipInteger & 0xFF;
    bytes[1] = (ipInteger >> 8) & 0xFF;
    bytes[2] = (ipInteger >> 16) & 0xFF;
    bytes[3] = (ipInteger >> 24) & 0xFF;

    return bytes.join('.');
}