import { useState } from "react";
import axios from "axios";

export const useVerification = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyImage = async (fileToVerify) => {
    if (!fileToVerify) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", fileToVerify);

    try {
      const API_URL = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/verify`
        : 'http://localhost:5000/api/verify';
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.success) {
        setResult(response.data.data);
        setError("");
      } else {
        setError(response.data.error || "Failed to verify image");
        setResult(null);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to verify image";
      setError(errorMessage);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setLoading(false);
    setError("");
  };

  return {
    file,
    setFile,
    result,
    loading,
    error,
    verifyImage,
    reset
  };
};
