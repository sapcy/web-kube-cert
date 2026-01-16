import forge from 'node-forge';
/**
 * RSA 키 쌍 생성 (2048 bit)
 */
export function generateKeyPair() {
    return forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
}
/**
 * CA 인증서 생성
 */
export function generateCA(commonName, validityDays, subjectAltName) {
    const keys = generateKeyPair();
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = generateSerialNumber();
    const now = new Date();
    cert.validity.notBefore = now;
    cert.validity.notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const attrs = [{ name: 'commonName', value: commonName }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    const extensions = [
        {
            name: 'basicConstraints',
            cA: true,
            critical: true,
        },
        {
            name: 'keyUsage',
            keyCertSign: true,
            cRLSign: true,
            digitalSignature: true,
            keyEncipherment: true,
            critical: true,
        },
    ];
    if (subjectAltName) {
        extensions.push({
            name: 'subjectAltName',
            altNames: [{ type: 2, value: subjectAltName }], // DNS type
        });
    }
    cert.setExtensions(extensions);
    cert.sign(keys.privateKey, forge.md.sha256.create());
    return {
        cert: forge.pki.certificateToPem(cert),
        key: forge.pki.privateKeyToPem(keys.privateKey),
        forgeKeyPair: keys,
        forgeCert: cert,
    };
}
/**
 * 서버 인증서 생성 (API Server, etcd server 등)
 */
export function generateServerCert(ca, commonName, validityDays, altNames) {
    const keys = generateKeyPair();
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = generateSerialNumber();
    const now = new Date();
    cert.validity.notBefore = now;
    cert.validity.notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    cert.setSubject([{ name: 'commonName', value: commonName }]);
    cert.setIssuer(ca.forgeCert.subject.attributes);
    const forgeAltNames = altNames.map((an) => ({
        type: an.type === 'dns' ? 2 : 7, // 2 = DNS, 7 = IP
        value: an.type === 'ip' ? ipToBytes(an.value) : an.value,
    }));
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: false,
            critical: true,
        },
        {
            name: 'keyUsage',
            digitalSignature: true,
            keyEncipherment: true,
            critical: true,
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
        },
        {
            name: 'subjectAltName',
            altNames: forgeAltNames,
        },
    ]);
    cert.sign(ca.forgeKeyPair.privateKey, forge.md.sha256.create());
    return {
        cert: forge.pki.certificateToPem(cert),
        key: forge.pki.privateKeyToPem(keys.privateKey),
    };
}
/**
 * 클라이언트 인증서 생성 (kubelet client, etcd client 등)
 */
export function generateClientCert(ca, commonName, organization, validityDays) {
    const keys = generateKeyPair();
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = generateSerialNumber();
    const now = new Date();
    cert.validity.notBefore = now;
    cert.validity.notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const subject = [
        { name: 'commonName', value: commonName },
    ];
    if (organization) {
        subject.push({ name: 'organizationName', value: organization });
    }
    cert.setSubject(subject);
    cert.setIssuer(ca.forgeCert.subject.attributes);
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: false,
            critical: true,
        },
        {
            name: 'keyUsage',
            digitalSignature: true,
            keyEncipherment: true,
            critical: true,
        },
        {
            name: 'extKeyUsage',
            clientAuth: true,
        },
    ]);
    cert.sign(ca.forgeKeyPair.privateKey, forge.md.sha256.create());
    return {
        cert: forge.pki.certificateToPem(cert),
        key: forge.pki.privateKeyToPem(keys.privateKey),
    };
}
/**
 * 피어 인증서 생성 (etcd peer - 서버 + 클라이언트)
 */
export function generatePeerCert(ca, commonName, validityDays, altNames) {
    const keys = generateKeyPair();
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = generateSerialNumber();
    const now = new Date();
    cert.validity.notBefore = now;
    cert.validity.notAfter = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    cert.setSubject([{ name: 'commonName', value: commonName }]);
    cert.setIssuer(ca.forgeCert.subject.attributes);
    const forgeAltNames = altNames.map((an) => ({
        type: an.type === 'dns' ? 2 : 7,
        value: an.type === 'ip' ? ipToBytes(an.value) : an.value,
    }));
    cert.setExtensions([
        {
            name: 'basicConstraints',
            cA: false,
            critical: true,
        },
        {
            name: 'keyUsage',
            digitalSignature: true,
            keyEncipherment: true,
            critical: true,
        },
        {
            name: 'extKeyUsage',
            serverAuth: true,
            clientAuth: true,
        },
        {
            name: 'subjectAltName',
            altNames: forgeAltNames,
        },
    ]);
    cert.sign(ca.forgeKeyPair.privateKey, forge.md.sha256.create());
    return {
        cert: forge.pki.certificateToPem(cert),
        key: forge.pki.privateKeyToPem(keys.privateKey),
    };
}
/**
 * Service Account 키 쌍 생성 (RSA)
 */
export function generateServiceAccountKeyPair() {
    const keys = generateKeyPair();
    return {
        publicKey: forge.pki.publicKeyToPem(keys.publicKey),
        privateKey: forge.pki.privateKeyToPem(keys.privateKey),
    };
}
/**
 * 시리얼 번호 생성
 */
function generateSerialNumber() {
    const bytes = forge.random.getBytesSync(16);
    return forge.util.bytesToHex(bytes);
}
/**
 * IP 주소를 바이트로 변환
 */
function ipToBytes(ip) {
    const parts = ip.split('.');
    if (parts.length === 4) {
        // IPv4
        return String.fromCharCode(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10), parseInt(parts[3], 10));
    }
    // IPv6는 일단 그대로 반환
    return ip;
}
/**
 * Service CIDR에서 첫 번째 IP 추출 (보통 kubernetes.default.svc의 ClusterIP)
 */
export function getFirstIPFromCIDR(cidr) {
    const [baseIP] = cidr.split('/');
    const parts = baseIP.split('.').map(Number);
    parts[3] = 1; // 첫 번째 유효한 IP
    return parts.join('.');
}
/**
 * SAN 문자열 파싱
 */
export function parseSANs(sans) {
    if (!sans.trim())
        return [];
    return sans.split(',').map((s) => {
        const value = s.trim();
        // IP 주소인지 확인
        const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
        return { type: isIP ? 'ip' : 'dns', value };
    });
}
//# sourceMappingURL=crypto.js.map