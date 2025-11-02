import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { FileCard, type FileItem } from "@/components/FileCard";

const sampleFiles: FileItem[] = [
  { id: "1", name: "Project Proposal.pdf", type: "document", size: "2.4 MB", date: "Today", starred: true },
  { id: "2", name: "Budget Report.xlsx", type: "document", size: "1.2 MB", date: "Yesterday" },
  { id: "3", name: "Team Photo.jpg", type: "image", size: "3.8 MB", date: "2 days ago", starred: true },
  { id: "4", name: "Meeting Recording.mp4", type: "video", size: "124 MB", date: "3 days ago" },
  { id: "5", name: "Presentation.pptx", type: "document", size: "5.6 MB", date: "1 week ago" },
  { id: "6", name: "Company Logo.png", type: "image", size: "856 KB", date: "1 week ago" },
  { id: "7", name: "Marketing Video.mp4", type: "video", size: "89 MB", date: "2 weeks ago" },
  { id: "8", name: "Podcast Episode 12.mp3", type: "audio", size: "24 MB", date: "2 weeks ago" },
  { id: "9", name: "Annual Report.pdf", type: "document", size: "4.2 MB", date: "3 weeks ago", starred: true },
  { id: "10", name: "Product Mockup.png", type: "image", size: "2.1 MB", date: "1 month ago" },
  { id: "11", name: "Contract Draft.docx", type: "document", size: "890 KB", date: "1 month ago" },
  { id: "12", name: "Website Banner.jpg", type: "image", size: "1.5 MB", date: "1 month ago" },
];

const Index = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = sampleFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "starred") return matchesSearch && file.starred;
    if (selectedCategory === "recent") return matchesSearch; // Could add date logic
    if (selectedCategory === "trash") return false; // No trash items yet
    
    // Filter by file type
    const typeMap: Record<string, FileItem["type"][]> = {
      documents: ["document"],
      images: ["image"],
      videos: ["video"],
      audio: ["audio"],
      archives: ["archive"],
    };
    
    const allowedTypes = typeMap[selectedCategory];
    return matchesSearch && allowedTypes?.includes(file.type);
  });

  const categoryNames: Record<string, string> = {
    all: "All Files",
    documents: "Documents",
    images: "Images",
    videos: "Videos",
    audio: "Audio",
    archives: "Archives",
    starred: "Starred Files",
    recent: "Recent Files",
    trash: "Trash",
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{categoryNames[selectedCategory]}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
                </p>
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mb-4">
                  <svg
                    className="h-10 w-10 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Upload your first file to get started"}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-2"
                }
              >
                {filteredFiles.map((file) => (
                  <FileCard key={file.id} file={file} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
