
import React, { useMemo } from 'react';
import type { OptimizedImage } from '../types';
import { PRESETS } from '../constants';
import { DownloadIcon, BackIcon } from './Icons';

interface ResultsViewProps {
    results: OptimizedImage[];
    onReset: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ResultsView: React.FC<ResultsViewProps> = ({ results, onReset }) => {

    const summary = useMemo(() => {
        const totalOriginalSize = results.reduce((acc, r) => acc + r.originalSize, 0);
        const totalOptimizedSize = results.reduce((acc, r) => acc + r.optimizedSize, 0);
        const totalSavings = totalOriginalSize - totalOptimizedSize;
        const percentageSavings = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0;
        return { totalOriginalSize, totalOptimizedSize, totalSavings, percentageSavings };
    }, [results]);

    const handleDownloadZip = async () => {
        const JSZip = window.JSZip;
        if (!JSZip) {
            alert('Could not find JSZip library.');
            return;
        }
        const zip = new JSZip();

        results.forEach(result => {
            const presetFolder = result.presetId;
            const fileName = `${result.outputName}.${result.format}`;
            zip.folder(presetFolder)?.file(fileName, result.optimizedBlob);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "optimized-images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center">
                 <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                    Optimization Complete!
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                    Your images have been successfully optimized. Download your assets or review the report below.
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Total Savings</h3>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">{formatBytes(summary.totalSavings)}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Size Reduction</h3>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">{summary.percentageSavings.toFixed(1)}%</p>
                </div>
                 <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">Total Files</h3>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">{results.length}</p>
                </div>
            </div>

             <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={handleDownloadZip}
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <DownloadIcon /> Download ZIP
                </button>
                <button
                    onClick={onReset}
                    className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                   <BackIcon /> Optimize More
                </button>
            </div>


            <div className="mt-12 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white/10 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Output File</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Original File</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Preset</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Original Size</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Optimized Size</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Reduction</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                    {results.map((result, index) => {
                                        const reduction = ((result.originalSize - result.optimizedSize) / result.originalSize * 100);
                                        const presetInfo = PRESETS.find(p => p.id === result.presetId);
                                        return (
                                        <tr key={`${result.originalName}-${result.presetId}-${index}`}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">{result.outputName}.{result.format}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{result.originalName}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{presetInfo?.name || result.presetId}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{formatBytes(result.originalSize)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{formatBytes(result.optimizedSize)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600 dark:text-green-400 font-medium">
                                                {reduction > 0 ? `-${reduction.toFixed(1)}%` : '0%'}
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
