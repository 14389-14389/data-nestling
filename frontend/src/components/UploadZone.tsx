import { useCallback, useState } from "react";
import { Upload, FileCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/services/api";

interface UploadZoneProps {
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadZone = ({ onClose, onUploadSuccess }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success).length;
      
      toast({
        title: "Upload successful!",
        description: `${successfulUploads} out of ${files.length} files uploaded successfully.`,
        variant: "default",
      });
      
      onUploadSuccess();
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleUploadFiles(files);
      }
    },
    [handleUploadFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        handleUploadFiles(files);
      }
    },
    [handleUploadFiles]
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-card rounded-2xl shadow-large border-2 p-8 animate-scale-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground">Upload Files</h3>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onClose} 
            className="h-10 w-10"
            disabled={isUploading}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-105"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center gap-4">
            {isUploading ? (
              <>
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-foreground">
                    Uploading files...
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we save your files
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center animate-float">
                  {isDragging ? (
                    <FileCheck className="h-10 w-10 text-primary-foreground" />
                  ) : (
                    <Upload className="h-10 w-10 text-primary-foreground" />
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-foreground">
                    {isDragging ? "Drop files here!" : "Drag and drop your files"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Or click the button below to browse your computer
                  </p>
                </div>

                {/* FIXED: Proper file input with label */}
                <div className="relative">
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                  />
                  <Button
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold pointer-events-none"
                    disabled={isUploading}
                  >
                    Browse Files
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Documents
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Images
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Videos
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Audio
                  </span>
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Archives
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm text-accent-foreground font-medium">
            ✅ Connected to backend! Files will be saved to MongoDB Atlas and available across all your devices.
          </p>
        </div>
      </div>
    </div>
  );
};
