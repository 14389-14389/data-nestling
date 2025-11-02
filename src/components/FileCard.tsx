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

export interface FileItem {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "audio" | "archive";
  size: string;
  date: string;
  starred?: boolean;
}

interface FileCardProps {
  file: FileItem;
  viewMode: "grid" | "list";
}

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

export const FileCard = ({ file, viewMode }: FileCardProps) => {
  const Icon = fileIcons[file.type];

  if (viewMode === "list") {
    return (
      <div className="group flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-medium transition-all animate-fade-in">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", fileBgColors[file.type])}>
          <Icon className={cn("h-5 w-5", fileColors[file.type])} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{file.name}</h3>
          <p className="text-xs text-muted-foreground">{file.size}</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:block">{file.date}</span>

          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <Star className={cn("h-4 w-4", file.starred && "fill-yellow-400 text-yellow-400")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                {file.starred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
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
    <div className="group relative rounded-lg border bg-card p-6 hover:shadow-medium transition-all animate-fade-in cursor-pointer">
      <div className="flex flex-col items-center gap-4">
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-xl", fileBgColors[file.type])}>
          <Icon className={cn("h-8 w-8", fileColors[file.type])} />
        </div>

        <div className="text-center w-full">
          <h3 className="font-medium text-sm text-foreground truncate">{file.name}</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{file.size}</p>
            <span className="text-muted-foreground">•</span>
            <p className="text-xs text-muted-foreground">{file.date}</p>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
          <Star className={cn("h-4 w-4", file.starred && "fill-yellow-400 text-yellow-400")} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              {file.starred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
