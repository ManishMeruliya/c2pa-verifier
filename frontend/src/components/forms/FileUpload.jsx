import { useState } from "react";
import { cn } from "../../utils/cn";
import Icon from "../ui/Icon";

const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 10 * 1024 * 1024, // 10MB
  className = "",
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file) => {
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    setError("");
    onFileSelect(file);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer",
          dragActive
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-300 bg-red-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <Icon name="upload" className="w-10 h-10 text-blue-600" />
          </div>
          
          <div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              Drop your image here
            </p>
            <p className="text-gray-500">
              or <span className="text-blue-600 font-medium">click to browse</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Supports JPG, PNG, WebP, and other image formats
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center space-x-2 text-red-600">
          <Icon name="error" className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
