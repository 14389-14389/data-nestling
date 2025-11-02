import { useState } from "react";
import { X, Upload, Search, FolderOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WelcomeGuideProps {
  onClose: () => void;
}

export const WelcomeGuide = ({ onClose }: WelcomeGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Upload,
      title: "Upload Your Files",
      description: "Click the Upload button in the top right to add your documents, images, videos, and more.",
      tip: "You can also drag and drop files directly into the window!",
    },
    {
      icon: FolderOpen,
      title: "Organize by Category",
      description: "Use the sidebar on the left to filter files by type - Documents, Images, Videos, etc.",
      tip: "Click on any category to see only those files.",
    },
    {
      icon: Search,
      title: "Find Files Fast",
      description: "Use the search bar at the top to quickly find any file by name.",
      tip: "Just start typing and results appear instantly!",
    },
    {
      icon: Star,
      title: "Star Important Files",
      description: "Click the star icon on any file to mark it as important and access it quickly.",
      tip: "Starred files appear in the 'Starred' section in the sidebar.",
    },
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-lg w-full p-6 shadow-large border-2 animate-scale-up">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Welcome to FileVault!</h3>
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="text-xl font-bold text-foreground">{currentStepData.title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-sm text-accent-foreground font-medium">
              💡 Tip: {currentStepData.tip}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                size="sm"
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                size="sm"
                className="bg-gradient-primary"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={onClose}
                size="sm"
                className="bg-gradient-primary"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
