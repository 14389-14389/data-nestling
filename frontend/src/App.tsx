import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { FileCard } from "@/components/FileCard";
import { UploadZone } from "@/components/UploadZone";
import { WelcomeGuide } from "@/components/WelcomeGuide";
import { LoginForm } from "@/components/LoginForm"; // Add this import
import { ProtectedRoute } from "@/components/ProtectedRoute"; // Add this import
import { useToast } from "@/hooks/use-toast";
import { getFiles, deleteFile, downloadFile, toggleStar, testConnection } from "@/services/api";
import { UploadedFile } from "@/services/types";
import { Button } from "@/components/ui/button";
import { initializePWA, isPWAInstallable } from "@/utils/pwa";
import { useAuth } from "@/hooks/use-auth"; // Add this import

// Move your main app logic to a separate component
function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isPWA, setIsPWA] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth(); // Add logout function

  // Calculate file statistics based on actual files
  const calculateFileStats = () => {
    const total = files.length;
    
    const documents = files.filter(f => {
      const mime = f.mime_type?.toLowerCase() || '';
      const name = f.original_name?.toLowerCase() || '';
      return mime.includes('document') || 
             mime.includes('pdf') || 
             mime.includes('text') ||
             mime.includes('word') ||
             mime.includes('msword') ||
             name.endsWith('.pdf') ||
             name.endsWith('.doc') ||
             name.endsWith('.docx') ||
             name.endsWith('.txt') ||
             name.endsWith('.rtf');
    }).length;
    
    const images = files.filter(f => {
      const mime = f.mime_type?.toLowerCase() || '';
      const name = f.original_name?.toLowerCase() || '';
      return mime.startsWith('image/') ||
             name.endsWith('.jpg') ||
             name.endsWith('.jpeg') ||
             name.endsWith('.png') ||
             name.endsWith('.gif') ||
             name.endsWith('.bmp') ||
             name.endsWith('.webp') ||
             name.endsWith('.svg');
    }).length;
    
    const videos = files.filter(f => {
      const mime = f.mime_type?.toLowerCase() || '';
      const name = f.original_name?.toLowerCase() || '';
      return mime.startsWith('video/') ||
             name.endsWith('.mp4') ||
             name.endsWith('.avi') ||
             name.endsWith('.mov') ||
             name.endsWith('.wmv') ||
             name.endsWith('.flv') ||
             name.endsWith('.webm') ||
             name.endsWith('.mkv');
    }).length;
    
    const audio = files.filter(f => {
      const mime = f.mime_type?.toLowerCase() || '';
      const name = f.original_name?.toLowerCase() || '';
      return mime.startsWith('audio/') ||
             name.endsWith('.mp3') ||
             name.endsWith('.wav') ||
             name.endsWith('.ogg') ||
             name.endsWith('.flac') ||
             name.endsWith('.aac');
    }).length;
    
    const archives = files.filter(f => {
      const mime = f.mime_type?.toLowerCase() || '';
      const name = f.original_name?.toLowerCase() || '';
      return mime.includes('zip') || 
             mime.includes('rar') || 
             mime.includes('tar') ||
             mime.includes('archive') ||
             mime.includes('compressed') ||
             name.endsWith('.zip') ||
             name.endsWith('.rar') ||
             name.endsWith('.7z') ||
             name.endsWith('.tar') ||
             name.endsWith('.gz');
    }).length;
    
    const starred = files.filter(f => f.starred).length;

    return {
      total,
      documents,
      images,
      videos,
      audio,
      archives,
      starred,
    };
  };

  const fileStats = calculateFileStats();

  // Check backend connection on startup
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await testConnection();
        setBackendStatus('connected');
        await loadFiles();
      } catch (error) {
        console.error('Backend connection failed:', error);
        setBackendStatus('error');
        const errorMessage = error.message.includes('blocked') 
          ? "Connection blocked by browser extension. Please disable ad blockers or privacy extensions and try again."
          : "Cannot connect to the server. Please make sure the backend is running on port 8000.";
        
        toast({
          title: "Backend Connection Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 10000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkBackend();
  }, [toast]);

  // Load files from backend
  const loadFiles = async () => {
    try {
      const filesData = await getFiles();
      setFiles(filesData || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    }
  };

  // Filter files based on search and category
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.original_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) || false;
    
    const matchesCategory = 
      activeCategory === "all" ||
      (activeCategory === "documents" && (
        file.mime_type?.includes('document') || 
        file.mime_type?.includes('pdf') || 
        file.mime_type?.includes('text') ||
        file.mime_type?.includes('word') ||
        file.original_name?.toLowerCase().endsWith('.pdf') ||
        file.original_name?.toLowerCase().endsWith('.doc') ||
        file.original_name?.toLowerCase().endsWith('.docx') ||
        file.original_name?.toLowerCase().endsWith('.txt')
      )) ||
      (activeCategory === "images" && (
        file.mime_type?.startsWith('image/') ||
        file.original_name?.toLowerCase().endsWith('.jpg') ||
        file.original_name?.toLowerCase().endsWith('.jpeg') ||
        file.original_name?.toLowerCase().endsWith('.png') ||
        file.original_name?.toLowerCase().endsWith('.gif')
      )) ||
      (activeCategory === "videos" && (
        file.mime_type?.startsWith('video/') ||
        file.original_name?.toLowerCase().endsWith('.mp4') ||
        file.original_name?.toLowerCase().endsWith('.avi') ||
        file.original_name?.toLowerCase().endsWith('.mov')
      )) ||
      (activeCategory === "audio" && (
        file.mime_type?.startsWith('audio/') ||
        file.original_name?.toLowerCase().endsWith('.mp3') ||
        file.original_name?.toLowerCase().endsWith('.wav') ||
        file.original_name?.toLowerCase().endsWith('.ogg')
      )) ||
      (activeCategory === "archives" && (
        file.mime_type?.includes('zip') || 
        file.mime_type?.includes('rar') || 
        file.mime_type?.includes('tar') ||
        file.mime_type?.includes('archive') ||
        file.original_name?.toLowerCase().endsWith('.zip') ||
        file.original_name?.toLowerCase().endsWith('.rar') ||
        file.original_name?.toLowerCase().endsWith('.7z')
      )) ||
      (activeCategory === "starred" && file.starred);

    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (filename: string, originalName: string) => {
    try {
      await downloadFile(filename, originalName);
      toast({
        title: "Download started",
        description: `Downloading ${originalName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      toast({
        title: "File deleted",
        description: "File has been permanently deleted",
      });
      loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the file",
        variant: "destructive",
      });
    }
  };

  const handleStar = async (fileId: string) => {
    try {
      await toggleStar(fileId);
      toast({
        title: "File updated",
        description: "File star status updated",
      });
      loadFiles();
    } catch (error) {
      console.error('Star toggle error:', error);
      toast({
        title: "Update failed",
        description: "Could not update file star status",
        variant: "destructive",
      });
    }
  };

  const handleUploadSuccess = () => {
    loadFiles();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center animate-spin mx-auto">
            <div className="h-8 w-8 rounded-full bg-background"></div>
          </div>
          <p className="text-muted-foreground font-medium">
            {backendStatus === 'checking' ? 'Checking server connection...' : 'Loading files...'}
          </p>
          {isPWA && (
            <p className="text-xs text-green-600 font-medium">
              📱 Running as PWA
            </p>
          )}
        </div>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <svg 
              className="h-10 w-10 text-destructive" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Server Connection Failed</h1>
            <p className="text-muted-foreground">
              Unable to connect to the backend server. Please ensure:
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1 mt-4">
              <li>• Backend server is running on port 8000</li>
              <li>• You have run python run.py in the backend directory</li>
              <li>• Disable browser extensions that might block localhost</li>
              <li>• No other applications are using port 8000</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-primary"
          >
            Retry Connection
          </Button>
          {isPWA && (
            <p className="text-xs text-green-600 font-medium">
              📱 Running as PWA - Files will be cached for offline access
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Optional: Show PWA indicator in header */}
      {isPWA && (
        <div className="bg-green-50 border-b border-green-200 py-1 px-4 text-center">
          <p className="text-xs text-green-700 font-medium">
            📱 Running as Installed App
          </p>
        </div>
      )}
      
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUploadClick={() => setShowUploadZone(true)}
        onHelpClick={() => setShowWelcomeGuide(true)}
        onLogout={logout} // Add logout handler
        isPWA={isPWA}
      />

      <div className="flex">
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          fileStats={fileStats}
        />

        <main className="flex-1 p-6">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery || activeCategory !== "all" ? "No files found" : "No files yet"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  {searchQuery || activeCategory !== "all"
                    ? "Try adjusting your search or filter to find what you are looking for."
                    : "Get started by uploading your first file to the cloud."}
                </p>
              </div>
              {(searchQuery || activeCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-3"
              }
            >
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  viewMode={viewMode}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onStar={handleStar}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showUploadZone && (
        <UploadZone
          onClose={() => setShowUploadZone(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {showWelcomeGuide && (
        <WelcomeGuide onClose={() => setShowWelcomeGuide(false)} />
      )}
    </div>
  );
}

// Main App component with authentication
function App() {
  // Initialize PWA
  useEffect(() => {
    initializePWA();
  }, []);

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export default App;