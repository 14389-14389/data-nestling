import { UploadedFile } from './types';

// Use environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Enhanced request handler with better error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    
    // Check if it's a blocked request
    if (error.message.includes('Failed to fetch') || error.message.includes('blocked')) {
      throw new Error('Connection blocked by browser or extension. Please check your browser settings.');
    }
    
    throw new Error(`Failed to connect to server: ${error.message}`);
  }
}

// Test backend connection
export const testConnection = async (): Promise<{ status: string; message: string }> => {
  return apiRequest<{ status: string; message: string }>('/api/health');
};

// Get all files
export const getFiles = async (): Promise<UploadedFile[]> => {
  try {
    const files = await apiRequest<UploadedFile[]>('/api/files');
    return Array.isArray(files) ? files : [];
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
};

// Upload file
export const uploadFile = async (file: File): Promise<{ success: boolean; file?: UploadedFile }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, file: result };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Download file
export const downloadFile = async (fileId: string, originalName: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/files/${fileId}/download`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

// Delete file
export const deleteFile = async (fileId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/api/files/${fileId}`, {
    method: 'DELETE',
  });
};

// Toggle star
export const toggleStar = async (fileId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/api/files/${fileId}/star`, {
    method: 'PATCH',
  });
};
