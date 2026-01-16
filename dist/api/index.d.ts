import type { KubeCertRequest, KubeCertResult } from '../types';
export { generateKubernetesPKI } from './certificates';
export { generateKubeconfigs } from './kubeconfig';
export { createCertZip } from './zip';
export * from './crypto';
/**
 * 기본 요청 값
 */
export declare const defaultRequest: KubeCertRequest;
/**
 * Kubernetes PKI 인증서 전체 생성
 */
export declare function generateKubeCerts(request: KubeCertRequest): Promise<KubeCertResult>;
/**
 * ZIP 파일 다운로드
 */
export declare function downloadZip(blob: Blob, filename?: string): void;
//# sourceMappingURL=index.d.ts.map