import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/auth";
import { BarChart3, LineChart, PieChart, Box, Download, FileImage } from "lucide-react";
import ChartRenderer from "./chart-renderer";

interface File {
  id: string;
  originalName: string;
  status: string;
  data: any[];
}

interface CreatedChart {
  id: string;
  title: string;
  type: string;
  xAxis: string;
  yAxis: string;
  fileId: string;
  config: any;
  createdAt: string;
}

export default function ChartGenerator() {
  const [selectedFile, setSelectedFile] = useState("");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("");
  const [title, setTitle] = useState("");
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [createdChart, setCreatedChart] = useState<CreatedChart | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch approved files
  const { data: files = [] } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });

  const approvedFiles = files.filter(file => file.status === "approved");

  // Update available columns when file is selected
  useEffect(() => {
    if (selectedFile) {
      const file = approvedFiles.find(f => f.id === selectedFile);
      if (file && file.data && file.data.length > 0) {
        setAvailableColumns(Object.keys(file.data[0]));
      }
    }
  }, [selectedFile, approvedFiles]);

  // Create chart mutation
  const createChartMutation = useMutation({
    mutationFn: async (chartData: any) => {
      const response = await apiRequest("POST", "/api/charts", chartData);
      return response.json();
    },
    onSuccess: (data: CreatedChart) => {
      toast({
        title: "Chart created successfully!",
        description: "Your visualization is ready",
      });
      setCreatedChart(data);
      queryClient.invalidateQueries({ queryKey: ["/api/charts"] });
      // Reset form
      setSelectedFile("");
      setXAxis("");
      setYAxis("");
      setChartType("");
      setTitle("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create chart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateChart = () => {
    if (!selectedFile || !xAxis || !yAxis || !chartType || !title) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createChartMutation.mutate({
      fileId: selectedFile,
      title,
      type: chartType,
      xAxis,
      yAxis,
      config: {
        // Additional chart configuration can be added here
      },
    });
  };

  const chartTypes = [
    { 
      id: "bar", 
      name: "Bar Chart", 
      icon: BarChart3,
      description: "Compare values across categories" 
    },
    { 
      id: "line", 
      name: "Line Chart", 
      icon: LineChart,
      description: "Show trends over time" 
    },
    { 
      id: "pie", 
      name: "Pie Chart", 
      icon: PieChart,
      description: "Show parts of a whole" 
    },
    { 
      id: "3d", 
      name: "3D Chart", 
      icon: Box,
      description: "Interactive 3D visualization" 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 text-blue-600" size={20} />
          Create Chart
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dataset Selection */}
        <div>
          <Label htmlFor="dataset" className="block text-sm font-medium text-gray-700 mb-2">
            Select Dataset
          </Label>
          <Select 
            value={selectedFile} 
            onValueChange={setSelectedFile}
            data-testid="select-dataset"
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an approved file" />
            </SelectTrigger>
            <SelectContent>
              {approvedFiles.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.originalName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {approvedFiles.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No approved files available. Upload and get approval first.
            </p>
          )}
        </div>

        {/* Chart Title */}
        <div>
          <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Chart Title
          </Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter chart title"
            data-testid="input-title"
          />
        </div>

        {/* Axis Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="x-axis" className="block text-sm font-medium text-gray-700 mb-2">
              X-Axis
            </Label>
            <Select 
              value={xAxis} 
              onValueChange={setXAxis}
              disabled={!selectedFile}
              data-testid="select-x-axis"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select X-axis" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="y-axis" className="block text-sm font-medium text-gray-700 mb-2">
              Y-Axis
            </Label>
            <Select 
              value={yAxis} 
              onValueChange={setYAxis}
              disabled={!selectedFile}
              data-testid="select-y-axis"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Y-axis" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Type Selection */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {chartTypes.map((type) => {
              const IconComponent = type.icon;
              const isSelected = chartType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`p-3 border rounded-lg transition-all text-center ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                  data-testid={`chart-type-${type.id}`}
                >
                  <IconComponent className="mx-auto mb-1" size={20} />
                  <p className="text-xs font-medium">{type.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateChart}
          disabled={createChartMutation.isPending || !selectedFile || !xAxis || !yAxis || !chartType || !title}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          data-testid="button-generate-chart"
        >
          {createChartMutation.isPending ? (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating Chart...
            </div>
          ) : (
            <div className="flex items-center">
              <BarChart3 className="mr-2" size={16} />
              Generate Chart
            </div>
          )}
        </Button>

        {/* Chart Preview */}
        <div className="mt-6 border-2 border-gray-200 rounded-lg p-4">
          {createdChart ? (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Chart Preview</h3>
              <ChartRenderer chart={createdChart} />
              {/* Download Buttons (shown when chart exists) */}
              <div className="flex justify-center space-x-4 mt-4">
                <Button variant="outline" size="sm">
                  <Download className="mr-2" size={16} />
                  PNG
                </Button>
                <Button variant="outline" size="sm">
                  <FileImage className="mr-2" size={16} />
                  PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Chart Preview</h3>
              <p className="text-gray-500">
                Your chart will appear here after generation
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
