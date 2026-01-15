import forge from 'node-forge'
import type { CertFile, CAInfo } from '../types'
import { generateClientCert } from './crypto'

/**
 * Kubeconfig 파일 생성
 */
export function generateKubeconfigs(
  kubernetesCA: CAInfo,
  apiServerAddress: string,
  clusterName: string,
  certDays: number
): CertFile[] {
  const files: CertFile[] = []
  const apiServerURL = `https://${apiServerAddress}:6443`

  // 1. admin.conf
  const adminCert = generateClientCert(kubernetesCA, 'kubernetes-admin', 'system:masters', certDays)
  files.push({
    path: 'admin.conf',
    content: buildKubeconfig(
      clusterName,
      apiServerURL,
      kubernetesCA.cert,
      adminCert.cert,
      adminCert.key,
      'kubernetes-admin',
      `kubernetes-admin@${clusterName}`
    ),
    type: 'kubeconfig',
  })

  // 2. controller-manager.conf
  const controllerManagerCert = generateClientCert(
    kubernetesCA,
    'system:kube-controller-manager',
    null,
    certDays
  )
  files.push({
    path: 'controller-manager.conf',
    content: buildKubeconfig(
      clusterName,
      apiServerURL,
      kubernetesCA.cert,
      controllerManagerCert.cert,
      controllerManagerCert.key,
      'system:kube-controller-manager',
      `system:kube-controller-manager@${clusterName}`
    ),
    type: 'kubeconfig',
  })

  // 3. scheduler.conf
  const schedulerCert = generateClientCert(
    kubernetesCA,
    'system:kube-scheduler',
    null,
    certDays
  )
  files.push({
    path: 'scheduler.conf',
    content: buildKubeconfig(
      clusterName,
      apiServerURL,
      kubernetesCA.cert,
      schedulerCert.cert,
      schedulerCert.key,
      'system:kube-scheduler',
      `system:kube-scheduler@${clusterName}`
    ),
    type: 'kubeconfig',
  })

  // 4. kubelet.conf (bootstrap 용이 아닌 일반 kubelet.conf)
  const kubeletCert = generateClientCert(
    kubernetesCA,
    `system:node:${apiServerAddress}`,
    'system:nodes',
    certDays
  )
  files.push({
    path: 'kubelet.conf',
    content: buildKubeconfig(
      clusterName,
      apiServerURL,
      kubernetesCA.cert,
      kubeletCert.cert,
      kubeletCert.key,
      `system:node:${apiServerAddress}`,
      `system:node:${apiServerAddress}@${clusterName}`
    ),
    type: 'kubeconfig',
  })

  // 5. super-admin.conf (K8s 1.29+)
  const superAdminCert = generateClientCert(
    kubernetesCA,
    'kubernetes-super-admin',
    'system:masters',
    certDays
  )
  files.push({
    path: 'super-admin.conf',
    content: buildKubeconfig(
      clusterName,
      apiServerURL,
      kubernetesCA.cert,
      superAdminCert.cert,
      superAdminCert.key,
      'kubernetes-super-admin',
      `kubernetes-super-admin@${clusterName}`
    ),
    type: 'kubeconfig',
  })

  return files
}

/**
 * Kubeconfig YAML 생성
 */
function buildKubeconfig(
  clusterName: string,
  serverURL: string,
  caCert: string,
  clientCert: string,
  clientKey: string,
  userName: string,
  contextName: string
): string {
  const caData = pemToBase64(caCert)
  const clientCertData = pemToBase64(clientCert)
  const clientKeyData = pemToBase64(clientKey)

  return `apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: ${caData}
    server: ${serverURL}
  name: ${clusterName}
contexts:
- context:
    cluster: ${clusterName}
    user: ${userName}
  name: ${contextName}
current-context: ${contextName}
preferences: {}
users:
- name: ${userName}
  user:
    client-certificate-data: ${clientCertData}
    client-key-data: ${clientKeyData}
`
}

/**
 * PEM을 Base64로 변환
 */
function pemToBase64(pem: string): string {
  const lines = pem.split('\n')
  const base64Lines = lines.filter(
    (line) => !line.startsWith('-----') && line.trim() !== ''
  )
  return base64Lines.join('')
}
