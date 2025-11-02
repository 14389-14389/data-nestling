import { useState } from "react";
import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Star,
  Clock,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  count?: number;
  color?: string;
}

const categories: Category[] = [
  { id: "all", name: "All Files", icon: Folder, count: 48 },
  { id: "documents", name: "Documents", icon: FileText, count: 23, color: "text-blue-500" },
  { id: "images", name: "Images", icon: Image, count: 15, color: "text-green-500" },
  { id: "videos", name: "Videos", icon: Video, count: 6, color: "text-purple-500" },
  { id: "audio", name: "Audio", icon: Music, count: 4, color: "text-pink-500" },
  { id: "archives", name: "Archives", icon: Archive, count: 0, color: "text-orange-500" },
];

const quickAccess: Category[] = [
  { id: "starred", name: "Starred", icon: Star, count: 12 },
  { id: "recent", name: "Recent", icon: Clock, count: 8 },
  { id: "trash", name: "Trash", icon: Trash2, count: 3 },
];

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const Sidebar = ({ selectedCategory, onCategoryChange }: SidebarProps) => {
  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-xl shadow-medium flex flex-col">
      <div className="p-4 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Categories
          </h2>
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-medium scale-105"
                    : "text-foreground hover:bg-secondary/80 hover:translate-x-1"
                )}
              >
                <Icon className={cn("h-5 w-5", !isActive && category.color)} />
                <span className="flex-1 text-left">{category.name}</span>
                {category.count !== undefined && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1 pt-4 border-t">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Quick Access
          </h2>
          {quickAccess.map((item) => {
            const Icon = item.icon;
            const isActive = selectedCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onCategoryChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-medium scale-105"
                    : "text-foreground hover:bg-secondary/80 hover:translate-x-1"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.count !== undefined && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t bg-gradient-hero backdrop-blur-xl">
        <div className="space-y-3 p-3 rounded-lg bg-card/50 border shadow-soft">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-medium">Storage used</span>
            <span className="font-semibold text-foreground">42.8 GB / 100 GB</span>
          </div>
          <div className="h-2.5 bg-background rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-primary w-[43%] rounded-full transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-glow" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">57.2 GB remaining</p>
        </div>
      </div>
    </aside>
  );
};
