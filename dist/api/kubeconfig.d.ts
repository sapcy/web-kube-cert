import type { CertFile, CAInfo } from '../types';
/**
 * Kubeconfig 파일 생성
 */
export declare function generateKubeconfigs(kubernetesCA: CAInfo, apiServerAddress: string, clusterName: string, certDays: number): CertFile[];
//# sourceMappingURL=kubeconfig.d.ts.map