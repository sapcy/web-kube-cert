import type { KubeCertResult } from '../types';
export interface KubeCertOutputProps {
    result: KubeCertResult | null;
    error: string | null;
    onDownload: () => void;
}
export declare function KubeCertOutput({ result, error, onDownload }: KubeCertOutputProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=KubeCertOutput.d.ts.map