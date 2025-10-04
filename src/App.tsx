import React, { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { Header } from "./components/Header";
import { FileUploader } from "./components/FileUploader";
import { OptimizationWorkspace } from "./components/OptimizationWorkspace";
import { ResultsView } from "./components/ResultsView";
import { PRESETS } from "./constants";
import type {
  UploadedFile,
  OptimizedImage,
  WorkflowStep,
  OutputFormat,
} from "./types";
import { processImage } from "./services/imageService";
import { Footer } from "./components/Footer";

const AppContent: React.FC = () => {
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<string[]>(
    PRESETS.map((p) => p.id)
  );
  const [selectedFormats, setSelectedFormats] = useState<OutputFormat[]>([
    "webp",
  ]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);
  const { theme } = useTheme();

  // keep html root classes in sync
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  // cleanup object URLs from previews
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [uploadedFiles]);

  const handleFilesUpload = useCallback((files: File[]) => {
    if (!files.length) return;

    let didAddNewFile = false;

    setUploadedFiles((prev) => {
      const existingIds = new Set(prev.map((f) => f.id));
      const incoming = files.map((file) => ({
        file,
        id: `${file.name}-${file.lastModified}`,
        preview: URL.createObjectURL(file),
        outputName:
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name,
      }));

      const deduped: typeof incoming = [];
      for (const upload of incoming) {
        if (existingIds.has(upload.id)) {
          URL.revokeObjectURL(upload.preview);
          continue;
        }
        existingIds.add(upload.id);
        deduped.push(upload);
      }

      if (!deduped.length) return prev;

      didAddNewFile = true;
      return [...prev, ...deduped];
    });

    if (didAddNewFile) {
      setWorkflowStep("configure");
    }
  }, []);

  const handleNameChange = useCallback((fileId: string, newName: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, outputName: newName } : f))
    );
  }, []);

  // safer optimize: error-tolerant + limited concurrency
  const handleOptimize = useCallback(async () => {
    if (!uploadedFiles.length) return;

    setIsProcessing(true);
    setWorkflowStep("processing");

    const presetsToUse = PRESETS.filter((p) => selectedPresets.includes(p.id));

    // build task functions
    const taskFns: Array<() => Promise<OptimizedImage | null>> = [];
    for (const uf of uploadedFiles) {
      for (const preset of presetsToUse) {
        for (const fmt of selectedFormats) {
          taskFns.push(async () => {
            try {
              return await processImage(uf.file, preset, fmt, uf.outputName);
            } catch (err) {
              console.error("processImage failed", {
                file: uf.file.name,
                preset: preset.id,
                fmt,
                err,
              });
              return null;
            }
          });
        }
      }
    }

    // simple concurrency limiter (4 at a time)
    const results: OptimizedImage[] = [];
    const running = new Set<Promise<void>>();
    const limit = 4;

    for (const fn of taskFns) {
      const p = fn().then((r) => {
        if (r) results.push(r);
        running.delete(p);
      });
      running.add(p);
      if (running.size >= limit) await Promise.race(running);
    }
    await Promise.all(running);

    setOptimizedImages(results);
    setIsProcessing(false);
    setWorkflowStep("complete");
  }, [uploadedFiles, selectedPresets, selectedFormats]);

  const handleReset = useCallback(() => {
    setUploadedFiles([]);
    setOptimizedImages([]);
    setSelectedPresets(PRESETS.map((p) => p.id));
    setSelectedFormats(["webp"]);
    setWorkflowStep("upload");
  }, []);

  const renderContent = () => {
    switch (workflowStep) {
      case "upload":
        return <FileUploader onFilesUpload={handleFilesUpload} />;
      case "configure":
      case "processing":
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
      case "complete":
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
