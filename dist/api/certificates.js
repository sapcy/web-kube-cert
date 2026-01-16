import { generateCA, generateServerCert, generateClientCert, generatePeerCert, generateServiceAccountKeyPair, getFirstIPFromCIDR, parseSANs, } from './crypto';
/**
 * 기본 Kubernetes PKI 인증서 생성
 */
export function generateKubernetesPKI(request) {
    const files = [];
    const { clusterName, apiServerAddress, additionalSANs = '', serviceCIDR, etcdServers = '', certDays, caDays, includeEtcd, } = request;
    // 1. Kubernetes CA 생성
    const kubernetesCA = generateCA('kubernetes', caDays);
    files.push({ path: 'ssl/ca.crt', content: kubernetesCA.cert, type: 'certificate' });
    files.push({ path: 'ssl/ca.key', content: kubernetesCA.key, type: 'key' });
    // 2. Front Proxy CA 생성
    const frontProxyCA = generateCA('front-proxy-ca', caDays, 'front-proxy-ca');
    files.push({ path: 'ssl/front-proxy-ca.crt', content: frontProxyCA.cert, type: 'certificate' });
    files.push({ path: 'ssl/front-proxy-ca.key', content: frontProxyCA.key, type: 'key' });
    // 3. API Server 인증서
    const apiServerSANs = buildAPIServerSANs(clusterName, apiServerAddress, serviceCIDR, additionalSANs);
    const apiServerCert = generateServerCert(kubernetesCA, 'kube-apiserver', certDays, apiServerSANs);
    files.push({ path: 'ssl/apiserver.crt', content: apiServerCert.cert, type: 'certificate' });
    files.push({ path: 'ssl/apiserver.key', content: apiServerCert.key, type: 'key' });
    // 4. API Server Kubelet Client 인증서
    const apiServerKubeletClient = generateClientCert(kubernetesCA, 'kube-apiserver-kubelet-client', 'system:masters', certDays);
    files.push({ path: 'ssl/apiserver-kubelet-client.crt', content: apiServerKubeletClient.cert, type: 'certificate' });
    files.push({ path: 'ssl/apiserver-kubelet-client.key', content: apiServerKubeletClient.key, type: 'key' });
    // 5. Front Proxy Client 인증서
    const frontProxyClient = generateClientCert(frontProxyCA, 'front-proxy-client', null, certDays);
    files.push({ path: 'ssl/front-proxy-client.crt', content: frontProxyClient.cert, type: 'certificate' });
    files.push({ path: 'ssl/front-proxy-client.key', content: frontProxyClient.key, type: 'key' });
    // 6. Service Account 키 쌍
    const saKeyPair = generateServiceAccountKeyPair();
    files.push({ path: 'ssl/sa.pub', content: saKeyPair.publicKey, type: 'key' });
    files.push({ path: 'ssl/sa.key', content: saKeyPair.privateKey, type: 'key' });
    // 7. etcd 인증서 (옵션)
    let etcdCA;
    if (includeEtcd) {
        etcdCA = generateCA('etcd-ca', caDays, 'etcd-ca');
        const etcdFiles = generateEtcdCerts(etcdCA, kubernetesCA, apiServerAddress, etcdServers, certDays);
        files.push(...etcdFiles);
    }
    return {
        kubernetesCA,
        frontProxyCA,
        etcdCA,
        files,
    };
}
/**
 * etcd 인증서 생성
 */
function generateEtcdCerts(etcdCA, kubernetesCA, apiServerAddress, etcdServers, certDays) {
    const files = [];
    const etcdAddresses = etcdServers.trim()
        ? etcdServers.split(',').map((s) => s.trim())
        : [apiServerAddress];
    // etcd CA
    files.push({ path: 'ssl/etcd/ca.crt', content: etcdCA.cert, type: 'certificate' });
    files.push({ path: 'ssl/etcd/ca.key', content: etcdCA.key, type: 'key' });
    // etcd 서버 인증서용 SAN
    const etcdSANs = [
        { type: 'dns', value: 'localhost' },
        { type: 'ip', value: '127.0.0.1' },
        { type: 'ip', value: '::1' },
    ];
    etcdAddresses.forEach((addr) => {
        const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(addr);
        etcdSANs.push({ type: isIP ? 'ip' : 'dns', value: addr });
    });
    // etcd Server 인증서
    const etcdServer = generateServerCert(etcdCA, apiServerAddress, certDays, etcdSANs);
    files.push({ path: 'ssl/etcd/server.crt', content: etcdServer.cert, type: 'certificate' });
    files.push({ path: 'ssl/etcd/server.key', content: etcdServer.key, type: 'key' });
    // etcd Peer 인증서
    const etcdPeer = generatePeerCert(etcdCA, apiServerAddress, certDays, etcdSANs);
    files.push({ path: 'ssl/etcd/peer.crt', content: etcdPeer.cert, type: 'certificate' });
    files.push({ path: 'ssl/etcd/peer.key', content: etcdPeer.key, type: 'key' });
    // etcd Healthcheck Client 인증서
    const healthcheckClient = generateClientCert(etcdCA, 'kube-etcd-healthcheck-client', 'system:masters', certDays);
    files.push({ path: 'ssl/etcd/healthcheck-client.crt', content: healthcheckClient.cert, type: 'certificate' });
    files.push({ path: 'ssl/etcd/healthcheck-client.key', content: healthcheckClient.key, type: 'key' });
    // API Server etcd Client 인증서
    const apiserverEtcdClient = generateClientCert(etcdCA, 'kube-apiserver-etcd-client', 'system:masters', certDays);
    files.push({ path: 'ssl/apiserver-etcd-client.crt', content: apiserverEtcdClient.cert, type: 'certificate' });
    files.push({ path: 'ssl/apiserver-etcd-client.key', content: apiserverEtcdClient.key, type: 'key' });
    return files;
}
/**
 * API Server SAN 목록 생성
 */
function buildAPIServerSANs(clusterName, apiServerAddress, serviceCIDR, additionalSANs) {
    const sans = [];
    // 기본 DNS 이름들
    const defaultDNSNames = [
        'kubernetes',
        'kubernetes.default',
        'kubernetes.default.svc',
        `kubernetes.default.svc.cluster.local`,
        'localhost',
    ];
    defaultDNSNames.forEach((dns) => {
        sans.push({ type: 'dns', value: dns });
    });
    // API Server 주소
    const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(apiServerAddress);
    sans.push({ type: isIP ? 'ip' : 'dns', value: apiServerAddress });
    // Service CIDR의 첫 번째 IP (kubernetes.default.svc의 ClusterIP)
    const serviceIP = getFirstIPFromCIDR(serviceCIDR);
    sans.push({ type: 'ip', value: serviceIP });
    // localhost IP
    sans.push({ type: 'ip', value: '127.0.0.1' });
    // 추가 SAN
    const additionalParsed = parseSANs(additionalSANs);
    sans.push(...additionalParsed);
    return sans;
}
//# sourceMappingURL=certificates.js.map