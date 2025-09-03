import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Bus, Users, FileSpreadsheet, TrendingUp, Database, LogOut, Download, HardDrive, Settings, FileCheck, Check, X, Eye, Clock } from "lucide-react";

interface AdminStats {
  activeUsers: number;
  monthlyFiles: number;
  chartsGenerated: number;
  storageUsed: string;
  pendingApprovals: number;
}

interface PendingFile {
  id: string;
  originalName: string;
  userId: string;
  uploadedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Activity {
  id: string;
  type: "upload" | "chart" | "download";
  user: string;
  action: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/stats/admin"],
  });

  const { data: pendingFiles = [] } = useQuery<PendingFile[]>({
    queryKey: ["/api/files/pending"],
  });

  // File approval mutations
  const approveFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("PATCH", `/api/files/${fileId}/approve`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve file");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File approved",
        description: "File has been approved for processing",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
    onError: (error: any) => {
      console.error("Approval error:", error);
      toast({
        title: "Error approving file",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const rejectFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("PATCH", `/api/files/${fileId}/reject`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reject file");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File rejected",
        description: "File has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/admin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
    },
    onError: (error: any) => {
      console.error("Rejection error:", error);
      toast({
        title: "Error rejecting file",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Mock activity data since we don't have this endpoint yet
  const recentActivity: Activity[] = [
    {
      id: "1",
      type: "upload",
      user: "Sarah Johnson",
      action: "uploaded financial_data.xlsx",
      timestamp: "15 minutes ago"
    },
    {
      id: "2", 
      type: "chart",
      user: "Mike Chen",
      action: "generated bar chart",
      timestamp: "1 hour ago"
    },
    {
      id: "3",
      type: "download",
      user: "Emily Rodriguez", 
      action: "downloaded chart as PDF",
      timestamp: "2 hours ago"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <FileSpreadsheet className="text-green-600" size={16} />;
      case "chart":
        return <TrendingUp className="text-blue-600" size={16} />;
      case "download":
        return <Download className="text-purple-600" size={16} />;
      default:
        return <Users className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mr-3">
                <Bus className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DataViz Pro</h1>
                <span className="text-sm text-green-600 font-medium">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
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
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-active-users">
                    {stats?.activeUsers || 0}
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
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-pending-approvals">
                    {stats?.pendingApprovals || pendingFiles.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Files This Month</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-monthly-files">
                    {stats?.monthlyFiles || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Charts Generated</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-charts-generated">
                    {stats?.chartsGenerated || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Database className="text-yellow-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Storage Used</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-storage-used">
                    {stats?.storageUsed || "0GB"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Approval Queue */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileCheck className="mr-2 text-green-600" size={20} />
                File Approval Queue
              </h2>

              <div className="space-y-4">
                {pendingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4"
                    data-testid={`file-${file.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileSpreadsheet className="text-green-600 mr-3" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-sm text-gray-600">
                            Uploaded by: User {file.userId.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => approveFileMutation.mutate(file.id)}
                        disabled={approveFileMutation.isPending}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        data-testid={`approve-file-${file.id}`}
                      >
                        <Check className="mr-2" size={16} />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectFileMutation.mutate(file.id)}
                        disabled={rejectFileMutation.isPending}
                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                        data-testid={`reject-file-${file.id}`}
                      >
                        <X className="mr-2" size={16} />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-4"
                        data-testid={`preview-file-${file.id}`}
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingFiles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck className="mx-auto mb-2" size={48} />
                    <p>No pending file approvals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Activity Monitoring */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-600" size={20} />
                Recent User Activity
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Users className="text-gray-600" size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.user} {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">{activity.timestamp}</p>
                      </div>
                    </div>
                    {getActivityIcon(activity.type)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Usage Analytics */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-600" size={20} />
                Data Usage Overview
              </h2>
              
              <div className="h-64 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center text-white mb-4">
                <div className="text-center">
                  <TrendingUp className="mx-auto mb-2 opacity-50" size={48} />
                  <p className="text-lg font-medium">Usage Analytics Chart</p>
                  <p className="opacity-75 text-sm">Chart.js visualization will render here</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">6.2</p>
                  <p className="text-sm text-gray-600">Avg Files/User</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">12.4</p>
                  <p className="text-sm text-gray-600">Avg Charts/User</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Quick Actions */}
        <div className="mt-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="mr-2 text-green-600" size={20} />
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-center"
                  data-testid="button-export-data"
                >
                  <Download className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="font-medium text-gray-700">Export User Data</p>
                  <p className="text-sm text-gray-500">Download user activity reports</p>
                </button>
                
                <button 
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-center"
                  data-testid="button-manage-storage"
                >
                  <HardDrive className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="font-medium text-gray-700">Manage Storage</p>
                  <p className="text-sm text-gray-500">Clean up old files and optimize</p>
                </button>
                
                <button 
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors text-center"
                  data-testid="button-system-settings"
                >
                  <Settings className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="font-medium text-gray-700">System Settings</p>
                  <p className="text-sm text-gray-500">Configure platform preferences</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
