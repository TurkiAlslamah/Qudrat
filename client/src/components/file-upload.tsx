import { useState, useRef } from "react";
import { CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  currentFile?: string; // URL of current file
  label?: string;
  description?: string;
  className?: string;
}

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = "image/*",
  maxSize = 5,
  currentFile,
  label,
  description = "Drop an image here or browse",
  className = ""
}: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    if (accept === "image/*" && !file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  if (currentFile) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <div className="border border-secondary-300 rounded-lg p-4 bg-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <CloudUpload className="text-primary-600 h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">File uploaded</p>
                <p className="text-xs text-secondary-500">Click to view or change</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
        </label>
      )}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-primary-400 bg-primary-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-secondary-300 hover:border-primary-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <CloudUpload className={`mx-auto h-8 w-8 mb-2 ${
          error ? 'text-red-400' : 'text-secondary-400'
        }`} />
        <p className={`text-sm ${error ? 'text-red-600' : 'text-secondary-600'}`}>
          {error || description}
        </p>
        {!error && (
          <p className="text-xs text-secondary-500 mt-1">
            Maximum file size: {maxSize}MB
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;
