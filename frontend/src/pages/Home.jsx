import { useVerification } from "../hooks/useVerification";
import HeroSection from "../components/layout/HeroSection";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FileUpload from "../components/forms/FileUpload";
import ResultDisplay from "../components/ui/ResultDisplay";
import { useEffect, useState } from "react";

export default function Home() {
  const { file, setFile, result, loading, error, verifyImage, reset } = useVerification();
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(null);
    }
  }, [file]);

  const handleVerify = async () => {
    await verifyImage(file);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <HeroSection
          title="C2PA Image Verifier"
        />

        {/* Main Verification Section */}
        <div className="mb-20">
          <Card variant="elevated" className="max-w-4xl mx-auto shadow-xl border-0 bg-white">
            <Card.Content className="p-8">
              {!file ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Upload Your Image
                    </h2>
                    <p className="text-gray-600 text-base max-w-xl mx-auto">
                      Drag and drop your image or click to browse. We'll analyze it for C2PA metadata.
                    </p>
                  </div>

                  <FileUpload
                    onFileSelect={setFile}
                    className="mb-8"
                  />
                </>
              ) : (
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Image Ready for Verification
                    </h2>
                    <p className="text-gray-600 text-base">
                      Click "Verify Image" to analyze C2PA metadata
                    </p>
                  </div>
                  
                  <div className="relative max-w-md mx-auto">
                    <img
                      src={imageUrl}
                      alt="Uploaded image"
                      className="w-full h-64 object-cover rounded-xl shadow-lg border border-gray-200"
                    />
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="bg-white/90 hover:bg-white text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg shadow-sm transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove
                      </Button>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleVerify}
                  disabled={!file || loading}
                  loading={loading}
                  size="lg"
                  className="min-w-[180px] h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? "Verifying..." : "Verify Image"}
                </Button>
                
                {result && (
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    size="lg"
                    className="min-w-[180px] h-12 text-base font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Upload Another
                  </Button>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Error Section */}
        {error && (
          <div className="mb-20">
            <Card variant="elevated" className="max-w-5xl mx-auto shadow-xl border-0 bg-white">
              <Card.Content className="p-8">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-900 mb-2">
                      Verification Error
                    </h3>
                    <p className="text-red-700 text-base">{error}</p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mb-20">
            <ResultDisplay result={result} />
          </div>
        )}

       
      </div>
    </div>
  );
}
