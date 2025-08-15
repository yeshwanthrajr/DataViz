import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, FileSpreadsheet, CheckCircle, Clock, BarChart, LogOut, Clock4 } from "lucide-react";
import FileUpload from "@/components/file-upload";
import ChartGenerator from "@/components/chart-generator";
import ChartsList from "@/components/charts-list";

interface Stats {
  totalUploads: number;
  approved: number;
  pending: number;
  charts: number;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats/dashboard"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
                <ChartLine className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DataViz Pro</h1>
                <span className="text-sm text-blue-600 font-medium">Normal User Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700" data-testid="user-name">{user?.name}</span>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="p-2 text-gray-500 hover:text-gray-700"
                data-testid="button-logout"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Clock4 className="text-yellow-600 mr-3" size={20} />
            <div>
              <h3 className="font-medium text-yellow-800">Approval Required</h3>
              <p className="text-sm text-yellow-700">
                Your uploads require Super Admin approval before processing.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Uploads</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-total-uploads">
                    {stats?.totalUploads || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-approved">
                    {stats?.approved || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-pending">
                    {stats?.pending || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Charts Created</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-charts">
                    {stats?.charts || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <div className="lg:col-span-2">
            <FileUpload />
          </div>

          {/* Chart Generation Panel */}
          <div>
            <ChartGenerator />
          </div>
        </div>

        {/* Charts List Section */}
        <div className="mt-8">
          <ChartsList />
        </div>
      </div>
    </div>
  );
}
