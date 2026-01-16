import type { KubeCertRequest, CertFile, CAInfo } from '../types';
/**
 * Kubernetes PKI 인증서 생성
 */
export interface GeneratedCerts {
    kubernetesCA: CAInfo;
    frontProxyCA: CAInfo;
    etcdCA?: CAInfo;
    files: CertFile[];
}
/**
 * 기본 Kubernetes PKI 인증서 생성
 */
export declare function generateKubernetesPKI(request: KubeCertRequest): GeneratedCerts;
//# sourceMappingURL=certificates.d.ts.map