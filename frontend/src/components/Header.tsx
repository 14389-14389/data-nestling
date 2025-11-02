import { Search, Upload, Grid3x3, List, Bell, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
  onHelpClick: () => void;
}

export const Header = ({ 
  viewMode, 
  onViewModeChange, 
  searchQuery, 
  onSearchChange, 
  onUploadClick, 
  onHelpClick 
}: HeaderProps) => {
  return (
    <TooltipProvider>
      <header className="border-b bg-card shadow-medium backdrop-blur-xl bg-card/80 sticky top-0 z-50">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
              <svg
                className="h-6 w-6 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">FileVault</h1>
              <p className="text-xs text-muted-foreground font-medium">Document Manager</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-4 ml-8">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-9 bg-secondary border-border focus:border-primary/50 focus:shadow-soft transition-all"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 border rounded-lg p-1 bg-secondary/50 backdrop-blur-sm">
                  <Button
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    onClick={() => onViewModeChange("grid")}
                    className="h-8 w-8 p-0 transition-all"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    onClick={() => onViewModeChange("list")}
                    className="h-8 w-8 p-0 transition-all"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch between grid and list view</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="hover:bg-secondary/80 transition-all relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="hover:bg-secondary/80 transition-all">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={onHelpClick} className="hover:bg-secondary/80 transition-all">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & Guide</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onUploadClick} className="gap-2 bg-gradient-primary hover:shadow-glow transition-all duration-300 hover:scale-105 font-semibold">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload new files</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};