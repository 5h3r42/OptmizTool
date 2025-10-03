
import React from 'react';
import type { UploadedFile, OutputFormat } from '../types';
import { PRESETS } from '../constants';
import { BackIcon, CheckIcon, SpinnerIcon } from './Icons';

interface OptimizationWorkspaceProps {
    files: UploadedFile[];
    selectedPresets: string[];
    setSelectedPresets: (presets: string[]) => void;
    selectedFormats: OutputFormat[];
    setSelectedFormats: (formats: OutputFormat[]) => void;
    onOptimize: () => void;
    isProcessing: boolean;
    onReset: () => void;
    onNameChange: (fileId: string, newName: string) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const outputFormatOptions: {id: OutputFormat, name: string, description: string}[] = [
    {id: 'webp', name: 'WebP', description: 'Modern format with superior compression.'},
    {id: 'jpg', name: 'JPG', description: 'Best for photos and complex images.'},
    {id: 'png', name: 'PNG', description: 'Ideal for images with transparency.'},
    {id: 'pdf', name: 'PDF', description: 'Document format for easy sharing.'},
]

export const OptimizationWorkspace: React.FC<OptimizationWorkspaceProps> = ({
    files,
    selectedPresets,
    setSelectedPresets,
    selectedFormats,
    setSelectedFormats,
    onOptimize,
    isProcessing,
    onReset,
    onNameChange
}) => {
    const handlePresetToggle = (presetId: string) => {
        setSelectedPresets(
            selectedPresets.includes(presetId)
                ? selectedPresets.filter((id) => id !== presetId)
                : [...selectedPresets, presetId]
        );
    };

    const handleFormatToggle = (formatId: OutputFormat) => {
        setSelectedFormats(
            selectedFormats.includes(formatId)
                ? selectedFormats.filter((id) => id !== formatId)
                : [...selectedFormats, formatId]
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="sticky top-24">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Optimization Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-x-8 gap-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Image Presets</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select the image sizes you need.</p>
                            <div className="space-y-4 mt-4">
                                {PRESETS.map((preset) => (
                                    <div key={preset.id} className="relative flex items-start">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id={preset.id}
                                                aria-describedby={`${preset.id}-description`}
                                                name="presets"
                                                type="checkbox"
                                                checked={selectedPresets.includes(preset.id)}
                                                onChange={() => handlePresetToggle(preset.id)}
                                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-800 dark:border-gray-600"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor={preset.id} className="font-medium text-gray-900 dark:text-white">{preset.name}</label>
                                            <p id={`${preset.id}-description`} className="text-gray-500 dark:text-gray-400">{preset.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Output Format</h3>
                             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose the final file format(s).</p>
                             <div className="space-y-4 mt-4">
                                {outputFormatOptions.map((option) => (
                                    <div key={option.id} className="relative flex items-start">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id={`format-${option.id}`}
                                                aria-describedby={`format-${option.id}-description`}
                                                name="formats"
                                                type="checkbox"
                                                checked={selectedFormats.includes(option.id)}
                                                onChange={() => handleFormatToggle(option.id)}
                                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:bg-gray-800 dark:border-gray-600"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm leading-6">
                                            <label htmlFor={`format-${option.id}`} className="font-medium text-gray-900 dark:text-white">{option.name}</label>
                                            <p id={`format-${option.id}-description`} className="text-gray-500 dark:text-gray-400">{option.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                         <button
                            onClick={onOptimize}
                            disabled={isProcessing || selectedPresets.length === 0 || files.length === 0 || selectedFormats.length === 0}
                            className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <SpinnerIcon />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckIcon />
                                    Optimize {files.length} {files.length > 1 ? 'Images' : 'Image'}
                                </>
                            )}
                        </button>
                         <button
                            onClick={onReset}
                            disabled={isProcessing}
                            className="w-full inline-flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:opacity-50"
                        >
                           <BackIcon /> Start Over
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Image Queue ({files.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((uploadedFile) => (
                        <div key={uploadedFile.id} className="rounded-lg bg-gray-100 dark:bg-gray-800 shadow-sm flex flex-col overflow-hidden">
                            <div className="relative">
                                <img src={uploadedFile.preview} alt={uploadedFile.file.name} className="h-full w-full object-cover aspect-square" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                                    <p className="text-xs font-medium truncate">{uploadedFile.file.name}</p>
                                    <p className="text-xs text-gray-300">{formatBytes(uploadedFile.file.size)}</p>
                                </div>
                            </div>
                            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                <label htmlFor={`name-${uploadedFile.id}`} className="sr-only">Output file name</label>
                                <input
                                    type="text"
                                    id={`name-${uploadedFile.id}`}
                                    value={uploadedFile.outputName}
                                    onChange={(e) => onNameChange(uploadedFile.id, e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-1.5"
                                    placeholder="Output file name"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};