import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";
import { 
  useAchievements, 
  AchievementType, 
  AchievementFormData,
  InternshipFormData,
  CurricularFormData,
  ExtracurricularFormData,
  PlacementFormData,
  SkillFormData
} from "@/hooks/useAchievements";

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedType,
    isSubmitting,
    selectAchievementType,
    submitAchievement,
    getFormFields,
    achievementOptions
  } = useAchievements();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

  // Handle achievement type selection
  const handleTypeSelect = (value: string) => {
    selectAchievementType(value as AchievementType);
    reset(); // Reset form when type changes
    setSelectedFile(null);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file only');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!selectedType) return;

    const formFields = getFormFields(selectedType);
    
    // Check if PDF is required
    if (formFields.pdfRequired && !selectedFile) {
      alert('PDF file is required for this achievement type');
      return;
    }

    // Prepare form data
    const formData: AchievementFormData = {
      ...data,
      ...(selectedFile && { pdfFile: selectedFile })
    };

    const success = await submitAchievement(formData);
    if (success) {
      reset();
      setSelectedFile(null);
    }
  };

  // Handle modal close
  const handleClose = () => {
    reset();
    setSelectedFile(null);
    onClose();
  };

  // Handle back to selection
  const handleBack = () => {
    selectAchievementType(null as any);
    reset();
    setSelectedFile(null);
  };

  // Render form fields dynamically
  const renderFormFields = () => {
    if (!selectedType) return null;

    const formConfig = getFormFields(selectedType);
    
    return (
      <div className="space-y-4">
        {formConfig.fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {field.type === "text" && (
              <Input
                id={field.name}
                {...register(field.name, { 
                  required: field.required ? `${field.label} is required` : false 
                })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
            
            {field.type === "textarea" && (
              <Textarea
                id={field.name}
                {...register(field.name, { 
                  required: field.required ? `${field.label} is required` : false 
                })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={3}
              />
            )}
            
            {field.type === "select" && field.options && (
              <Select onValueChange={(value) => setValue(field.name, value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {errors[field.name] && (
              <p className="text-red-500 text-sm">
                {errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* File Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="pdfFile">
            PDF Document
            {formConfig.pdfRequired && <span className="text-red-500 ml-1">*</span>}
            {!formConfig.pdfRequired && <span className="text-gray-500 ml-1">(Optional)</span>}
          </Label>
          
          <div className="flex items-center gap-2">
            <Input
              id="pdfFile"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <Label
              htmlFor="pdfFile"
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
            >
              <Upload className="w-4 h-4" />
              Choose PDF File
            </Label>
            {selectedFile && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                {selectedFile.name}
              </div>
            )}
          </div>
          
          {formConfig.pdfRequired && !selectedFile && (
            <p className="text-red-500 text-sm">PDF file is required</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            Add Achievement
          </DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          // Achievement Type Selection
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Select the type of achievement you want to add:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {achievementOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleTypeSelect(option.value)}
                >
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Achievement Form
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2 p-3 bg-accent rounded-md">
              <span className="text-xl">
                {achievementOptions.find(opt => opt.value === selectedType)?.icon}
              </span>
              <span className="font-medium">
                {achievementOptions.find(opt => opt.value === selectedType)?.label}
              </span>
            </div>

            {renderFormFields()}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Achievement'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AchievementModal;