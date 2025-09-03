import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart3, TrendingUp, PieChart, LineChart, Eye, Download, Trash2 } from "lucide-react";
import ChartRenderer from "./chart-renderer";

interface Chart {
  id: string;
  title: string;
  type: string;
  xAxis: string;
  yAxis: string;
  fileId: string;
  config: any;
  createdAt: string;
}

const getChartIcon = (type: string) => {
  switch (type) {
    case 'bar':
      return <BarChart3 size={16} />;
    case 'line':
      return <LineChart size={16} />;
    case 'pie':
      return <PieChart size={16} />;
    default:
      return <TrendingUp size={16} />;
  }
};

const getChartTypeLabel = (type: string) => {
  switch (type) {
    case 'bar':
      return 'Bar Chart';
    case 'line':
      return 'Line Chart';
    case 'pie':
      return 'Pie Chart';
    case '3d':
      return '3D Chart';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1) + ' Chart';
  }
};

export default function ChartsList() {
  const [openChartId, setOpenChartId] = React.useState<string | null>(null);
  const { data: charts = [], isLoading } = useQuery<Chart[]>({
    queryKey: ["/api/charts"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 text-blue-600" size={20} />
            Your Charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (charts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 text-blue-600" size={20} />
            Your Charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Charts Yet</h3>
            <p className="text-gray-500">
              Create your first chart from your approved data files
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="mr-2 text-blue-600" size={20} />
            Your Charts ({charts.length})
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {charts.map((chart) => (
            <div
              key={chart.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              data-testid={`chart-item-${chart.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {getChartIcon(chart.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900" data-testid={`chart-title-${chart.id}`}>
                        {chart.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {getChartTypeLabel(chart.type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">X-Axis:</span> {chart.xAxis}
                      </p>
                      <p>
                        <span className="font-medium">Y-Axis:</span> {chart.yAxis}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(chart.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dialog open={openChartId === chart.id} onOpenChange={(open) => setOpenChartId(open ? chart.id : null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center space-x-1"
                        data-testid={`button-view-${chart.id}`}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{chart.title}</DialogTitle>
                        <DialogDescription>
                          <div className="mt-2 mb-4">
                            <Badge variant="secondary" className="text-xs mb-2">
                              {getChartTypeLabel(chart.type)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1 mb-4">
                            <p><span className="font-medium">X-Axis:</span> {chart.xAxis}</p>
                            <p><span className="font-medium">Y-Axis:</span> {chart.yAxis}</p>
                            <p className="text-xs text-gray-500">Created: {new Date(chart.createdAt).toLocaleDateString()}</p>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <ChartRenderer chart={chart} />
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-1"
                    data-testid={`button-download-${chart.id}`}
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}