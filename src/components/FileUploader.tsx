
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploaderProps {
    onFilesUpload: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesUpload }) => {
    const [isDragging, setIsDragging] = useState(false);

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
        </div>
    );
};
