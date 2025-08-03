function convertIPtoHex(line: any) {
    let match = /(\d+\.\d+\.\d+\.\d+)/.exec(line);
    if (match) {
        let matchText = match[1];
        let ipParts = matchText.split('.');
        let p3 = parseInt(ipParts[3],10);
        let p3x = p3.toString(16);
        let p2 = parseInt(ipParts[2],10);
        let p2x = p2.toString(16);
        let p1 = parseInt(ipParts[1],10);
        let p1x = p1.toString(16);
        let p0 = parseInt(ipParts[0],10);
        let p0x = p0.toString(16);
        let dec = p3 + p2 * 256 + p1 * 256 * 256 + p0 * 256 * 256 * 256;
        let hex = dec.toString(16);
        
        function pad2 (hex: string) {
            while (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        }
        function pad8 (hex: string) {
            while (hex.length < 8) {
                hex = "0" + hex;
            }
            return hex;
        }
        hex = "0x" + pad8(hex);
        return hex;
    } else {
        return null;
    }
}

// Build array of IPs based on hex value of first and last IP
function getIPRange(firstHost: any, lastHost: any) {
    let hostRange = [];
    for(let i = firstHost; i < lastHost; i++) {   
        let oc4 = (i>>24) & 0xff;
        let oc3 = (i>>16) & 0xff;
        let oc2 = (i>>8) & 0xff;
        let oc1 = i & 0xff;
        hostRange.push(oc4 + "." + oc3 + "." + oc2 + "." + oc1);
    }
    return hostRange;
}

export default {
    convertIPtoHex,
    getIPRange
}
