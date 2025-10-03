
export interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    outputName: string;
}

export type OutputFormat = 'webp' | 'jpg' | 'png' | 'pdf';

export interface Preset {
    id: string;
    name: string;
    description: string;
    width: number;
    height: number;
    quality: number; // 0 to 1
    targetSizeKB: number;
}

export interface OptimizedImage {
    originalName: string;
    outputName: string;
    presetId: string;
    optimizedBlob: Blob;
    originalSize: number; // in bytes
    optimizedSize: number; // in bytes
    dimensions: { width: number, height: number };
    format: OutputFormat;
}

export type WorkflowStep = 'upload' | 'configure' | 'processing' | 'complete';

declare global {
    interface Window {
        JSZip: any;
        jspdf: any;
    }
}