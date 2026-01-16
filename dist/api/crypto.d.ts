import forge from 'node-forge';
import type { CAInfo } from '../types';
/**
 * RSA 키 쌍 생성 (2048 bit)
 */
export declare function generateKeyPair(): forge.pki.rsa.KeyPair;
/**
 * CA 인증서 생성
 */
export declare function generateCA(commonName: string, validityDays: number, subjectAltName?: string): CAInfo;
/**
 * 서버 인증서 생성 (API Server, etcd server 등)
 */
export declare function generateServerCert(ca: CAInfo, commonName: string, validityDays: number, altNames: Array<{
    type: 'dns' | 'ip';
    value: string;
}>): {
    cert: string;
    key: string;
};
/**
 * 클라이언트 인증서 생성 (kubelet client, etcd client 등)
 */
export declare function generateClientCert(ca: CAInfo, commonName: string, organization: string | null, validityDays: number): {
    cert: string;
    key: string;
};
/**
 * 피어 인증서 생성 (etcd peer - 서버 + 클라이언트)
 */
export declare function generatePeerCert(ca: CAInfo, commonName: string, validityDays: number, altNames: Array<{
    type: 'dns' | 'ip';
    value: string;
}>): {
    cert: string;
    key: string;
};
/**
 * Service Account 키 쌍 생성 (RSA)
 */
export declare function generateServiceAccountKeyPair(): {
    publicKey: string;
    privateKey: string;
};
/**
 * Service CIDR에서 첫 번째 IP 추출 (보통 kubernetes.default.svc의 ClusterIP)
 */
export declare function getFirstIPFromCIDR(cidr: string): string;
/**
 * SAN 문자열 파싱
 */
export declare function parseSANs(sans: string): Array<{
    type: 'dns' | 'ip';
    value: string;
}>;
//# sourceMappingURL=crypto.d.ts.map