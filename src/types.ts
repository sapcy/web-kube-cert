import type forge from 'node-forge'

/**
 * Kubernetes PKI 인증서 생성 요청
 */
export interface KubeCertRequest {
  /** 클러스터 이름 (기본값: kubernetes) */
  clusterName: string
  /** API Server 주소 (마스터 노드 IP 또는 도메인) */
  apiServerAddress: string
  /** 추가 SAN (Subject Alternative Names) - 쉼표로 구분 */
  additionalSANs?: string
  /** Service CIDR (기본값: 10.96.0.0/12) */
  serviceCIDR: string
  /** etcd 서버 주소들 (쉼표로 구분) */
  etcdServers?: string
  /** 인증서 유효 기간 (일, 기본값: 3650) */
  certDays: number
  /** CA 인증서 유효 기간 (일, 기본값: 36500) */
  caDays: number
  /** etcd 인증서 포함 여부 (기본값: true) */
  includeEtcd: boolean
  /** Kubeconfig 파일 포함 여부 (기본값: true) */
  includeKubeconfig: boolean
}

/**
 * 인증서 파일 정보
 */
export interface CertFile {
  path: string
  content: string
  type: 'certificate' | 'key' | 'kubeconfig'
}

/**
 * 키 쌍
 */
export interface KeyPair {
  publicKey: string
  privateKey: string
  certificate?: string
}

/**
 * CA 정보
 */
export interface CAInfo {
  cert: string
  key: string
  forgeKeyPair: forge.pki.rsa.KeyPair
  forgeCert: forge.pki.Certificate
}

/**
 * 생성 결과
 */
export interface KubeCertResult {
  files: CertFile[]
  zipBlob: Blob
  summary: {
    totalFiles: number
    caFiles: number
    certFiles: number
    keyFiles: number
    kubeconfigFiles: number
  }
}

/**
 * 진행 상태
 */
export interface GenerationProgress {
  step: string
  progress: number
  total: number
}
