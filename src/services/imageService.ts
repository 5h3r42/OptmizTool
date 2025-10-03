
import type { Preset, OptimizedImage, OutputFormat } from '../types';

export const processImage = (file: File, preset: Preset, outputFormat: OutputFormat, outputName: string): Promise<OptimizedImage | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(null);
                    return;
                }

                // Calculate new dimensions while preserving aspect ratio
                const { width: originalWidth, height: originalHeight } = img;
                const targetAspectRatio = preset.width / preset.height;
                const originalAspectRatio = originalWidth / originalHeight;

                let drawWidth, drawHeight;

                if (originalAspectRatio > targetAspectRatio) {
                    drawWidth = preset.width;
                    drawHeight = preset.width / originalAspectRatio;
                } else {
                    drawHeight = preset.height;
                    drawWidth = preset.height * originalAspectRatio;
                }
                
                canvas.width = Math.round(drawWidth);
                canvas.height = Math.round(drawHeight);

                // For PNGs with transparency, we keep it transparent. For others, fill with white.
                if (file.type !== 'image/png' || outputFormat === 'jpg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                if (outputFormat === 'pdf') {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({
                        orientation: canvas.width > canvas.height ? 'l' : 'p',
                        unit: 'px',
                        format: [canvas.width, canvas.height]
                    });
                    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, canvas.width, canvas.height);
                    const blob = pdf.output('blob');
                    resolve({
                        originalName: file.name,
                        outputName,
                        presetId: preset.id,
                        optimizedBlob: blob,
                        originalSize: file.size,
                        optimizedSize: blob.size,
                        dimensions: { width: canvas.width, height: canvas.height },
                        format: 'pdf'
                    });
                } else {
                    const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve({
                                    originalName: file.name,
                                    outputName,
                                    presetId: preset.id,
                                    optimizedBlob: blob,
                                    originalSize: file.size,
                                    optimizedSize: blob.size,
                                    dimensions: { width: canvas.width, height: canvas.height },
                                    format: outputFormat
                                });
                            } else {
                                resolve(null);
                            }
                        },
                        mimeType,
                        preset.quality
                    );
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};