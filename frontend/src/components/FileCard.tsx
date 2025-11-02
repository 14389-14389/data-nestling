import { FileText, Image, Video, Music, Archive, MoreVertical, Star, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UploadedFile } from "@/services/api";

interface FileCardProps {
  file: UploadedFile;
  viewMode: "grid" | "list";
  onDownload: (filename: string, originalName: string) => void;
  onDelete: (fileId: string) => void;
  onStar?: (fileId: string) => void;
}

const getFileType = (mimeType: string): "document" | "image" | "video" | "audio" | "archive" => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'archive';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
};

const fileIcons = {
  document: FileText,
  image: Image,
  video: Video,
  audio: Music,
  archive: Archive,
};

const fileColors = {
  document: "text-blue-500",
  image: "text-green-500",
  video: "text-purple-500",
  audio: "text-pink-500",
  archive: "text-orange-500",
};

const fileBgColors = {
  document: "bg-blue-50 dark:bg-blue-950/30",
  image: "bg-green-50 dark:bg-green-950/30",
  video: "bg-purple-50 dark:bg-purple-950/30",
  audio: "bg-pink-50 dark:bg-pink-950/30",
  archive: "bg-orange-50 dark:bg-orange-950/30",
};

export const FileCard = ({ file, viewMode, onDownload, onDelete, onStar }: FileCardProps) => {
  const fileType = getFileType(file.mime_type);
  const Icon = fileIcons[fileType];
  const fileSize = formatFileSize(file.size);
  const formattedDate = formatDate(file.upload_date);

  const handleDownload = () => {
    onDownload(file.filename, file.original_name);
  };

  const handleDelete = () => {
    onDelete(file.id);
  };

  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-large hover:border-primary/20 transition-all duration-300 animate-fade-in hover:-translate-y-0.5">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-soft group-hover:scale-110 transition-transform duration-300", fileBgColors[fileType])}>
          <Icon className={cn("h-5 w-5", fileColors[fileType])} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{file.original_name}</h3>
          <p className="text-xs text-muted-foreground font-medium">{fileSize}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:block">{formattedDate}</span>

          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onStar?.(file.id);
            }}
          >
            <Star className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStar?.(file.id);
              }}>
                <Star className="mr-2 h-4 w-4" />
                Star
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-xl border bg-card p-6 hover:shadow-large hover:border-primary/30 transition-all duration-300 animate-scale-up cursor-pointer hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex flex-col items-center gap-4">
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-xl shadow-soft group-hover:shadow-medium group-hover:scale-110 transition-all duration-300", fileBgColors[fileType])}>
          <Icon className={cn("h-8 w-8", fileColors[fileType])} />
        </div>

        <div className="text-center w-full">
          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{file.original_name}</h3>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <p className="text-xs text-muted-foreground font-medium">{fileSize}</p>
            <span className="text-muted-foreground/50">•</span>
            <p className="text-xs text-muted-foreground font-medium">{formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            onStar?.(file.id);
          }}
        >
          <Star className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onStar?.(file.id);
            }}>
              <Star className="mr-2 h-4 w-4" />
              Star
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};