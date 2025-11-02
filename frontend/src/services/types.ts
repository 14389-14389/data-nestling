export interface UploadedFile {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  upload_date: string;
  starred: boolean;
}

export interface FileUploadResponse {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  upload_date: string;
  starred: boolean;
}

// Re-export UploadedFile as the main type
export type { UploadedFile as default };
