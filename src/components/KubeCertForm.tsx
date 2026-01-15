import React from 'react'
import type { KubeCertRequest } from '../types'

export interface KubeCertFormProps {
  request: KubeCertRequest
  loading: boolean
  onRequestChange: (request: KubeCertRequest) => void
  onSubmit: (e: React.FormEvent) => void
}

export function KubeCertForm({
  request,
  loading,
  onRequestChange,
  onSubmit,
}: KubeCertFormProps) {
  const updateField = <K extends keyof KubeCertRequest>(
    field: K,
    value: KubeCertRequest[K]
  ) => {
    onRequestChange({ ...request, [field]: value })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* 클러스터 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          클러스터 기본 정보
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              클러스터 이름
            </label>
            <input
              type="text"
              value={request.clusterName}
              onChange={(e) => updateField('clusterName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="kubernetes"
            />
            <p className="text-xs text-gray-500 mt-1">
              kubeconfig에서 사용될 클러스터 이름
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Server 주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={request.apiServerAddress}
              onChange={(e) => updateField('apiServerAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="192.168.1.100 또는 k8s-master.example.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              마스터 노드의 IP 주소 또는 도메인
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              추가 SAN (Subject Alternative Names)
            </label>
            <input
              type="text"
              value={request.additionalSANs}
              onChange={(e) => updateField('additionalSANs', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="k8s.example.com, 10.0.0.100"
            />
            <p className="text-xs text-gray-500 mt-1">
              API Server 인증서에 추가할 도메인/IP (쉼표로 구분)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service CIDR
            </label>
            <input
              type="text"
              value={request.serviceCIDR}
              onChange={(e) => updateField('serviceCIDR', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="10.96.0.0/12"
            />
            <p className="text-xs text-gray-500 mt-1">
              Kubernetes Service 네트워크 대역 (kubernetes.default.svc의 ClusterIP 결정)
            </p>
          </div>
        </div>
      </div>

      {/* etcd 설정 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          etcd 설정
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeEtcd"
              checked={request.includeEtcd}
              onChange={(e) => updateField('includeEtcd', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeEtcd" className="ml-2 text-sm text-gray-700">
              etcd 인증서 포함
            </label>
          </div>

          {request.includeEtcd && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                etcd 서버 주소들
              </label>
              <input
                type="text"
                value={request.etcdServers}
                onChange={(e) => updateField('etcdServers', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="비워두면 API Server 주소 사용"
              />
              <p className="text-xs text-gray-500 mt-1">
                etcd 클러스터 주소들 (쉼표로 구분). 비워두면 API Server 주소 사용
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Kubeconfig 설정 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Kubeconfig 설정
        </h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeKubeconfig"
            checked={request.includeKubeconfig}
            onChange={(e) => updateField('includeKubeconfig', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeKubeconfig" className="ml-2 text-sm text-gray-700">
            Kubeconfig 파일 포함 (admin.conf, controller-manager.conf, scheduler.conf, kubelet.conf)
          </label>
        </div>
      </div>

      {/* 인증서 유효 기간 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          인증서 유효 기간
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CA 인증서 유효 기간 (일)
            </label>
            <input
              type="number"
              value={request.caDays}
              onChange={(e) => updateField('caDays', parseInt(e.target.value) || 36500)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              기본값: 36500일 (약 100년)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              일반 인증서 유효 기간 (일)
            </label>
            <input
              type="number"
              value={request.certDays}
              onChange={(e) => updateField('certDays', parseInt(e.target.value) || 3650)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              기본값: 3650일 (약 10년)
            </p>
          </div>
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        type="submit"
        disabled={loading || !request.apiServerAddress.trim()}
        className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all ${
          loading || !request.apiServerAddress.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            인증서 생성 중...
          </span>
        ) : (
          '🔐 인증서 생성'
        )}
      </button>
    </form>
  )
}
