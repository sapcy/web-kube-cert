import React from 'react';
import type { KubeCertRequest } from '../types';
export interface KubeCertFormProps {
    request: KubeCertRequest;
    loading: boolean;
    onRequestChange: (request: KubeCertRequest) => void;
    onSubmit: (e: React.FormEvent) => void;
}
export declare function KubeCertForm({ request, loading, onRequestChange, onSubmit, }: KubeCertFormProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=KubeCertForm.d.ts.map