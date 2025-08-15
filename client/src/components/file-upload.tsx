import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Check, Clock, X } from "lucide-react";
import { apiRequest } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

interface UploadedFile {
  id: string;
  originalName: string;
  status: "pending" | "approved" | "rejected";
  uploadedAt: string;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload only Excel files (.xls or .xlsx)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const uploadedFile = await response.json();
      
      // Add to recent uploads
      const newUpload: UploadedFile = {
        id: uploadedFile.id,
        originalName: uploadedFile.originalName,
        status: uploadedFile.status,
        uploadedAt: uploadedFile.uploadedAt,
      };
      
      setRecentUploads(prev => [newUpload, ...prev.slice(0, 4)]);
      
      toast({
        title: "File uploaded successfully!",
        description: "Your file is pending Super Admin approval",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/dashboard'] });
      
      onUploadComplete?.();

    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="text-green-600" size={16} />;
      case "rejected":
        return <X className="text-red-600" size={16} />;
      default:
        return <Clock className="text-yellow-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="mr-2 text-blue-600" size={20} />
          Upload Excel File
        </h2>
        
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-blue-600 bg-blue-50' 
              : isUploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-blue-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          data-testid="file-upload-area"
        >
          {isUploading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing your file...</h3>
              <p className="text-gray-600">Please wait while we parse your Excel data</p>
            </div>
          ) : (
            <>
              <Upload className="text-4xl text-gray-400 mb-4 mx-auto" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop your Excel file here
              </h3>
              <p className="text-gray-600 mb-4">or click to browse (.xls, .xlsx files only)</p>
              <Button 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                data-testid="button-choose-file"
              >
                Choose File
              </Button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="file-input"
        />

        {/* Recent Uploads */}
        {recentUploads.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-medium text-gray-900">Recent Uploads</h3>
            {recentUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                data-testid={`upload-${upload.id}`}
              >
                <div className="flex items-center">
                  <FileSpreadsheet className="text-green-600 mr-3" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{upload.originalName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(upload.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(upload.status)}
                  <span className={`ml-2 px-3 py-1 text-sm rounded-full ${getStatusColor(upload.status)}`}>
                    {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
