
import React, { useState, useCallback, useMemo } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { OptimizationWorkspace } from './components/OptimizationWorkspace';
import { ResultsView } from './components/ResultsView';
import { PRESETS } from './constants';
import type { UploadedFile, Preset, OptimizedImage, WorkflowStep, OutputFormat } from './types';
import { processImage } from './services/imageService';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('upload');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [selectedPresets, setSelectedPresets] = useState<string[]>(PRESETS.map(p => p.id));
    const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>(['webp']);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);

    const { theme } = useTheme();

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);
    
    const handleFilesUpload = useCallback((files: File[]) => {
        const newUploadedFiles = files.map(file => ({
            file,
            id: `${file.name}-${file.lastModified}`,
            preview: URL.createObjectURL(file),
            outputName: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        }));
        setUploadedFiles(newUploadedFiles);
        setWorkflowStep('configure');
    }, []);

    const handleNameChange = useCallback((fileId: string, newName: string) => {
        setUploadedFiles(prevFiles =>
            prevFiles.map(f => (f.id === fileId ? { ...f, outputName: newName } : f))
        );
    }, []);

    const handleOptimize = useCallback(async () => {
        setIsProcessing(true);
        setWorkflowStep('processing');

        const presetsToUse = PRESETS.filter(p => selectedPresets.includes(p.id));
        const allOptimizedImages: OptimizedImage[] = [];

        const processingPromises: Promise<OptimizedImage | null>[] = [];
        for (const uploadedFile of uploadedFiles) {
            for (const preset of presetsToUse) {
                for (const format of selectedFormats) {
                    processingPromises.push(processImage(uploadedFile.file, preset, format, uploadedFile.outputName));
                }
            }
        }
        const results = await Promise.all(processingPromises);
        allOptimizedImages.push(...results.filter(r => r !== null) as OptimizedImage[]);
        
        setOptimizedImages(allOptimizedImages);
        setIsProcessing(false);
        setWorkflowStep('complete');
    }, [uploadedFiles, selectedPresets, selectedFormats]);

    const handleReset = useCallback(() => {
        setUploadedFiles([]);
        setOptimizedImages([]);
        setSelectedPresets(PRESETS.map(p => p.id));
        setSelectedFormats(['webp']);
        setWorkflowStep('upload');
    }, []);

    const renderContent = () => {
        switch (workflowStep) {
            case 'upload':
                return <FileUploader onFilesUpload={handleFilesUpload} />;
            case 'configure':
            case 'processing':
                return (
                    <OptimizationWorkspace 
                        files={uploadedFiles}
                        selectedPresets={selectedPresets}
                        setSelectedPresets={setSelectedPresets}
                        selectedFormats={selectedFormats}
                        setSelectedFormats={setSelectedFormats}
                        onOptimize={handleOptimize}
                        isProcessing={isProcessing}
                        onReset={handleReset}
                        onNameChange={handleNameChange}
                    />
                );
            case 'complete':
                return <ResultsView results={optimizedImages} onReset={handleReset} />;
            default:
                return <FileUploader onFilesUpload={handleFilesUpload} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AppContent />
    </ThemeProvider>
);

export default App;