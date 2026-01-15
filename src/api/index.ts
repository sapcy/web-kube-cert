import type { KubeCertRequest, KubeCertResult, CertFile } from '../types'
import { generateKubernetesPKI } from './certificates'
import { generateKubeconfigs } from './kubeconfig'
import { createCertZip } from './zip'

export { generateKubernetesPKI } from './certificates'
export { generateKubeconfigs } from './kubeconfig'
export { createCertZip } from './zip'
export * from './crypto'

/**
 * 기본 요청 값
 */
export const defaultRequest: KubeCertRequest = {
  clusterName: 'kubernetes',
  apiServerAddress: '',
  additionalSANs: '',
  serviceCIDR: '10.96.0.0/12',
  etcdServers: '',
  certDays: 3650,
  caDays: 36500,
  includeEtcd: true,
  includeKubeconfig: true,
}

/**
 * Kubernetes PKI 인증서 전체 생성
 */
export async function generateKubeCerts(request: KubeCertRequest): Promise<KubeCertResult> {
  // 입력 검증
  if (!request.apiServerAddress.trim()) {
    throw new Error('API Server 주소가 필요합니다')
  }

  const allFiles: CertFile[] = []

  // 1. PKI 인증서 생성
  const pkiResult = generateKubernetesPKI(request)
  allFiles.push(...pkiResult.files)

  // 2. Kubeconfig 파일 생성
  if (request.includeKubeconfig) {
    const kubeconfigFiles = generateKubeconfigs(
      pkiResult.kubernetesCA,
      request.apiServerAddress,
      request.clusterName,
      request.certDays
    )
    allFiles.push(...kubeconfigFiles)
  }

  // 3. ZIP 파일 생성
  const zipBlob = await createCertZip(allFiles)

  // 4. 요약 정보
  const summary = {
    totalFiles: allFiles.length,
    caFiles: allFiles.filter((f) => f.path.includes('ca.')).length,
    certFiles: allFiles.filter((f) => f.type === 'certificate').length,
    keyFiles: allFiles.filter((f) => f.type === 'key').length,
    kubeconfigFiles: allFiles.filter((f) => f.type === 'kubeconfig').length,
  }

  return {
    files: allFiles,
    zipBlob,
    summary,
  }
}

/**
 * ZIP 파일 다운로드
 */
export function downloadZip(blob: Blob, filename: string = 'kubernetes-pki.zip'): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
