
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploaderProps {
    onFilesUpload: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isAddingFromUrl, setIsAddingFromUrl] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesUpload(Array.from(e.target.files));
        }
    };
    
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const acceptedFiles = Array.from(e.dataTransfer.files).filter(file => 
                file.type.startsWith('image/')
            );
            if (acceptedFiles.length > 0) {
              onFilesUpload(acceptedFiles);
            }
            e.dataTransfer.clearData();
        }
    }, [onFilesUpload]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const createFileFromUrl = useCallback(async (rawUrl: string) => {
        const trimmedUrl = rawUrl.trim();
        if (!trimmedUrl) {
            throw new Error('Empty URL provided.');
        }

        let normalizedUrl = trimmedUrl;
        if (/^ttps?:\/\//i.test(normalizedUrl)) {
            normalizedUrl = `h${normalizedUrl}`;
        } else if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(normalizedUrl)) {
            normalizedUrl = `https://${normalizedUrl}`;
        }

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(normalizedUrl);
        } catch {
            throw new Error('Invalid URL format.');
        }

        const response = await fetch(parsedUrl.toString(), { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Failed to fetch image (status ${response.status}).`);
        }

        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
            throw new Error('The provided link is not an image.');
        }

        const urlPath = parsedUrl.pathname;
        const inferredName = decodeURIComponent(urlPath.substring(urlPath.lastIndexOf('/') + 1)) || 'remote-image';
        const typeParts = blob.type.split('/');
        const extension = typeParts.length > 1 ? typeParts[1].split('+')[0] : 'jpg';
        const filename = inferredName.includes('.') ? inferredName : `${inferredName}.${extension}`;

        return new File([blob], filename, { type: blob.type, lastModified: Date.now() });
    }, []);

    const handleAddFromUrl = useCallback(async () => {
        if (!imageUrl.trim()) {
            setUrlError('Please enter an image URL.');
            return;
        }

        try {
            setIsAddingFromUrl(true);
            setUrlError(null);

            const file = await createFileFromUrl(imageUrl);
            onFilesUpload([file]);
            setImageUrl('');
        } catch (error) {
            setUrlError(error instanceof Error ? error.message : 'Unable to add image from the provided URL.');
        } finally {
            setIsAddingFromUrl(false);
        }
    }, [createFileFromUrl, imageUrl, onFilesUpload]);

    return (
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Optimize Your WooCommerce Images
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Drag and drop your product images to get started. Bulk upload JPG, PNG, and WebP files and get perfectly sized assets in seconds.
            </p>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`mt-10 relative block w-full rounded-lg border-2 border-dashed p-12 text-center transition-colors duration-300 ${
                    isDragging 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
            >
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadIcon />
                    <span className="mt-4 block text-lg font-semibold text-gray-900 dark:text-white">
                        Drag & drop files here or click to upload
                    </span>
                    <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                        Supports JPG, PNG, WebP. Up to 10MB each.
                    </span>
                </label>
            </div>
            <div className="mt-8 space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Add from an image link</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            if (urlError) setUrlError(null);
                        }}
                        placeholder="Paste an image URL (e.g. https://m.media-amazon.com/images/I/51lACmGusCL.jpg)"
                        className="w-full sm:w-2/3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="button"
                        onClick={handleAddFromUrl}
                        disabled={isAddingFromUrl}
                        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
                    >
                        {isAddingFromUrl ? 'Adding…' : 'Add from URL'}
                    </button>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Need an example?{' '}
                    <button
                        type="button"
                        onClick={() => setImageUrl('https://m.media-amazon.com/images/I/51lACmGusCL.jpg')}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Use this sample image
                    </button>
                </div>
                {urlError && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {urlError}
                    </p>
                )}
            </div>
        </div>
    );
};
