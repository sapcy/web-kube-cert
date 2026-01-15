import React from 'react'
import type { KubeCertResult } from '../types'

export interface KubeCertOutputProps {
  result: KubeCertResult | null
  error: string | null
  onDownload: () => void
}

export function KubeCertOutput({ result, error, onDownload }: KubeCertOutputProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-red-500 text-xl">❌</span>
          <div>
            <h3 className="text-lg font-semibold text-red-800">오류 발생</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-lg font-semibold text-gray-700">
          Kubernetes PKI 인증서 생성기
        </h3>
        <p className="text-gray-500 mt-2">
          왼쪽 폼에서 클러스터 정보를 입력하고 인증서를 생성하세요.
        </p>
        <div className="mt-6 text-left bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">📋 생성되는 파일:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <code className="bg-gray-100 px-1 rounded">ca.crt/key</code> - Kubernetes CA</li>
            <li>• <code className="bg-gray-100 px-1 rounded">apiserver.crt/key</code> - API Server 인증서</li>
            <li>• <code className="bg-gray-100 px-1 rounded">front-proxy-*</code> - Front Proxy 인증서</li>
            <li>• <code className="bg-gray-100 px-1 rounded">etcd/*</code> - etcd 인증서</li>
            <li>• <code className="bg-gray-100 px-1 rounded">*.conf</code> - Kubeconfig 파일</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 성공 메시지 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-green-500 text-xl">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              인증서 생성 완료!
            </h3>
            <p className="text-green-600 mt-1">
              {result.summary.totalFiles}개의 파일이 생성되었습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 생성 요약</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {result.summary.caFiles}
            </div>
            <div className="text-sm text-gray-600">CA 파일</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {result.summary.certFiles}
            </div>
            <div className="text-sm text-gray-600">인증서</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {result.summary.keyFiles}
            </div>
            <div className="text-sm text-gray-600">키 파일</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {result.summary.kubeconfigFiles}
            </div>
            <div className="text-sm text-gray-600">Kubeconfig</div>
          </div>
        </div>
      </div>

      {/* 파일 목록 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 생성된 파일</h3>
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-1">
            {result.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50"
              >
                <span className="text-sm">
                  {file.type === 'certificate' && '📜'}
                  {file.type === 'key' && '🔑'}
                  {file.type === 'kubeconfig' && '📋'}
                </span>
                <code className="text-sm text-gray-700 font-mono">
                  {file.path}
                </code>
                <span className="text-xs text-gray-400 ml-auto">
                  {file.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <button
        onClick={onDownload}
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        kubernetes-pki.zip 다운로드
      </button>

      {/* 사용 방법 */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 사용 방법</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800">1. 압축 해제</h4>
            <pre className="mt-1 bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
              <code>unzip kubernetes-pki.zip</code>
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">2. 설치 스크립트 실행</h4>
            <pre className="mt-1 bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
              <code>{`cd kubernetes
chmod +x install.sh
sudo ./install.sh`}</code>
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">3. kubeadm init (새 클러스터)</h4>
            <pre className="mt-1 bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
              <code>kubeadm init --skip-phases=certs</code>
            </pre>
          </div>
        </div>
      </div>

      {/* 경고 메시지 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-yellow-500">⚠️</span>
          <div className="text-sm text-yellow-800">
            <strong>보안 주의:</strong> 생성된 키 파일(.key)은 절대 공개 저장소에 
            커밋하지 마세요. 안전한 곳에 보관하시기 바랍니다.
          </div>
        </div>
      </div>
    </div>
  )
}
