import { Search, Upload, Grid3x3, List, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header = ({ viewMode, onViewModeChange, searchQuery, onSearchChange }: HeaderProps) => {
  return (
    <header className="border-b bg-card shadow-soft">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <svg
              className="h-6 w-6 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">FileVault</h1>
            <p className="text-xs text-muted-foreground">Document Manager</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 ml-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="pl-9 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1 bg-secondary">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => onViewModeChange("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => onViewModeChange("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
          </Button>

          <Button size="icon" variant="ghost">
            <Settings className="h-5 w-5" />
          </Button>

          <Button className="gap-2 bg-gradient-primary hover:opacity-90">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>
    </header>
  );
};
