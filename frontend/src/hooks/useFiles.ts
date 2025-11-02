import { useState, useCallback } from 'react';
import { apiService, UploadedFile, FileListResponse } from '../services/api';

export const useFiles = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const uploadedFile = await apiService.uploadFile(file);
      setFiles(prev => [uploadedFile, ...prev]);
      return uploadedFile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: FileListResponse = await apiService.getFiles();
      setFiles(response.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFile = useCallback(async (filename: string, originalName: string) => {
    try {
      const blob = await apiService.downloadFile(filename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      throw err;
    }
  }, []);

  return {
    files,
    loading,
    error,
    uploadFile,
    fetchFiles,
    deleteFile,
    downloadFile,
  };
};
