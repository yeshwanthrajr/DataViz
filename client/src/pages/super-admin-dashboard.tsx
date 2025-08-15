import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Crown, Users, Clock, FileCheck, Shield, FileSpreadsheet, Check, X, Eye, UserPlus, Ban, ArrowUp, ArrowDown, LogOut } from "lucide-react";

interface SuperAdminStats {
  totalUsers: number;
  pendingApprovals: number;
  filesProcessed: number;
  adminRequests: number;
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

interface AdminRequest {
  id: string;
  userId: string;
  message: string;
  requestedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats } = useQuery<SuperAdminStats>({
    queryKey: ["/api/stats/superadmin"],
  });

  const { data: pendingFiles = [] } = useQuery<PendingFile[]>({
    queryKey: ["/api/files/pending"],
  });

  const { data: adminRequests = [] } = useQuery<AdminRequest[]>({
    queryKey: ["/api/admin-requests/pending"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // File approval mutations
  const approveFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("PATCH", `/api/files/${fileId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File approved",
        description: "File has been approved for processing",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/superadmin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("PATCH", `/api/files/${fileId}/reject`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File rejected",
        description: "File has been rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/files/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/superadmin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error rejecting file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin request mutations
  const approveAdminMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PATCH", `/api/admin-requests/${requestId}/approve`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User promoted to admin",
        description: "Admin request has been approved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin-requests/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/superadmin"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error approving request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const denyAdminMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await apiRequest("PATCH", `/api/admin-requests/${requestId}/deny`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Admin request denied",
        description: "Request has been denied",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin-requests/pending"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error denying request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // User role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User role updated",
        description: "User role has been changed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-green-100 text-green-800";
      case "superadmin":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center mr-3">
                <Crown className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DataViz Pro</h1>
                <span className="text-sm text-orange-600 font-medium">Super Admin Control Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="text-orange-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-total-users">
                    {stats?.totalUsers || 0}
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
                    {stats?.pendingApprovals || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileCheck className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Files Processed</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-files-processed">
                    {stats?.filesProcessed || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Admin Requests</p>
                  <p className="text-2xl font-semibold text-gray-900" data-testid="stat-admin-requests">
                    {stats?.adminRequests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Approval Section */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileSpreadsheet className="mr-2 text-orange-600" size={20} />
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
                    <FileSpreadsheet className="mx-auto mb-2" size={48} />
                    <p>No pending file approvals</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Promotion Requests */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserPlus className="mr-2 text-orange-600" size={20} />
                Admin Promotion Requests
              </h2>
              
              <div className="space-y-4">
                {adminRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4"
                    data-testid={`admin-request-${request.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <Users className="text-gray-600" size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            User {request.userId.slice(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-600">Request for admin access</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{request.message}</p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => approveAdminMutation.mutate(request.id)}
                        disabled={approveAdminMutation.isPending}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                        data-testid={`approve-admin-${request.id}`}
                      >
                        <Shield className="mr-2" size={16} />
                        Promote to Admin
                      </Button>
                      <Button
                        onClick={() => denyAdminMutation.mutate(request.id)}
                        disabled={denyAdminMutation.isPending}
                        className="flex-1 bg-red-600 text-white hover:bg-red-700"
                        data-testid={`deny-admin-${request.id}`}
                      >
                        <Ban className="mr-2" size={16} />
                        Deny
                      </Button>
                    </div>
                  </div>
                ))}
                
                {adminRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="mx-auto mb-2" size={48} />
                    <p>No pending admin requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <div className="mt-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="mr-2 text-orange-600" size={20} />
                User Management
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                        data-testid={`user-row-${user.id}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <Users className="text-gray-600" size={14} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {user.role === "user" && (
                              <Button
                                onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: "admin" })}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                data-testid={`promote-user-${user.id}`}
                              >
                                <ArrowUp size={16} />
                              </Button>
                            )}
                            {user.role === "admin" && (
                              <Button
                                onClick={() => updateUserRoleMutation.mutate({ userId: user.id, role: "user" })}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                data-testid={`demote-user-${user.id}`}
                              >
                                <ArrowDown size={16} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
