import { useCallback, useState } from "react";
import { Upload, FileCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface UploadZoneProps {
  onClose: () => void;
}

export const UploadZone = ({ onClose }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Files received!",
          description: `${files.length} file(s) ready to upload. This is a demo - connect a backend to save files.`,
        });
        setTimeout(onClose, 2000);
      }
    },
    [toast, onClose]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        toast({
          title: "Files received!",
          description: `${files.length} file(s) ready to upload. This is a demo - connect a backend to save files.`,
        });
        setTimeout(onClose, 2000);
      }
    },
    [toast, onClose]
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-card rounded-2xl shadow-large border-2 p-8 animate-scale-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground">Upload Files</h3>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-10 w-10">
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
          }`}
        >
          <div className="flex flex-col items-center gap-4">
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

            <label htmlFor="file-upload">
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300 font-semibold"
                asChild
              >
                <span>Browse Files</span>
              </Button>
            </label>

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
          </div>
        </div>

        <div className="mt-6 bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm text-accent-foreground font-medium">
            📌 Note: This is a demo interface. To actually save and manage files, you'll need to
            connect a backend storage system.
          </p>
        </div>
      </div>
    </div>
  );
};
