import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Crown, Users, Clock, FileCheck, Shield, FileSpreadsheet, Check, X, Eye, UserPlus, Ban, ArrowUp, ArrowDown, LogOut, Menu, Moon, Sun, Bell, Activity, Settings, Home, TrendingUp, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import "./dashboard-layout.css";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFile, setSelectedFile] = useState<PendingFile | null>(null);

  // Set the theme on the document body
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const navigationItems = [
    { id: 'Overview', label: 'Overview', icon: TrendingUp },
    { id: 'File Management', label: 'File Management', icon: FileSpreadsheet },
    { id: 'User Management', label: 'User Management', icon: Users },
    { id: 'Analytics', label: 'Analytics', icon: Activity },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'Overview':
        return <OverviewContent />;
      case 'File Management':
        return <FileManagementContent theme={theme} />;
      case 'User Management':
        return <UserManagementContent theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} />;
      case 'Analytics':
        return <PlaceholderContent title="Analytics" />;
      case 'Settings':
        return <SettingsContent theme={theme} setTheme={setTheme} />;
      default:
        return <OverviewContent />;
    }
  };
  
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });


  return (
    <div className={`dashboard-container ${theme}`}>
      {/* --- Sidebar --- */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="dashboard-logo">
            <div className="logo-icon">SA</div>
            <span className="logo-text">dataviz</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </Button>
        </div>
        <nav className="p-4">
          <ul>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveView(item.label);
                      setSidebarOpen(false); // Close sidebar on mobile after click
                    }}
                    className={`sidebar-nav-item ${activeView === item.label ? 'active' : ''}`}
                  >
                    <Icon className="icon" size={20} />
                    <span className="label">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="dashboard-main">
        {/* --- Header --- */}
        <header className="dashboard-header">
          <div className="flex items-center justify-between p-4">
            <div className="header-left">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mobile-menu-button"
              >
                <Menu size={20} />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{activeView}</h1>
            </div>
            <div className="header-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
              <div className="user-info">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200" data-testid="user-name">
                  {user?.name || 'Super Admin'}
                </span>
                <Badge variant="outline" className="role-badge">Super Admin</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* --- Content Area --- */}
        <div className="dashboard-content">
          <div className="dashboard-content-inner">
            <Tabs value={activeView} onValueChange={setActiveView} className="dashboard-tabs">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="Overview">Overview</TabsTrigger>
                <TabsTrigger value="File Management">File Management</TabsTrigger>
                <TabsTrigger value="User Management">User Management</TabsTrigger>
                <TabsTrigger value="Analytics">Analytics</TabsTrigger>
                <TabsTrigger value="Settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="Overview" className="tab-content">
                <div className="content-section">
                  {/* Super Admin Stats */}
                  <div className="stats-grid">
                    <Card className="stats-card">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg bg-orange-100 dark:bg-orange-900/50`}>
                            <Users className={`text-orange-600 dark:text-orange-400`} size={24} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="stat-total-users">
                              {stats?.totalUsers || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="stats-card">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50`}>
                            <Clock className={`text-yellow-600 dark:text-yellow-400`} size={24} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Approvals</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="stat-pending-approvals">
                              {stats?.pendingApprovals || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="stats-card">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg bg-green-100 dark:bg-green-900/50`}>
                            <FileCheck className={`text-green-600 dark:text-green-400`} size={24} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Files Processed</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="stat-files-processed">
                              {stats?.filesProcessed || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="stats-card">
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50`}>
                            <Shield className={`text-blue-600 dark:text-blue-400`} size={24} />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Admin Requests</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white" data-testid="stat-admin-requests">
                              {stats?.adminRequests || 0}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activity Feed */}
                  <div className="content-section">
                    <Card className="stats-card">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <FileSpreadsheet className="text-green-600 mr-3" size={16} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">File approved for processing</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Users className="text-blue-600 mr-3" size={16} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">User promoted to admin</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">5 hours ago</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="File Management" className="tab-content">
                <div className="content-section">
                  <FileManagementContent theme={theme} />
                </div>
              </TabsContent>

              <TabsContent value="User Management" className="tab-content">
                <div className="content-section">
                  <UserManagementContent theme={theme} searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} />
                </div>
              </TabsContent>

              <TabsContent value="Analytics" className="tab-content">
                <div className="content-section">
                  <PlaceholderContent title="Analytics" />
                </div>
              </TabsContent>

              <TabsContent value="Settings" className="tab-content">
                <div className="content-section">
                  <SettingsContent theme={theme} setTheme={setTheme} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// --- Content Components for Each View ---

const OverviewContent = () => {
  const { data: stats } = useQuery<SuperAdminStats>({ queryKey: ["/api/stats/superadmin"] });
  const { data: pendingFiles = [] } = useQuery<PendingFile[]>({ queryKey: ["/api/files/pending"] });

  const overviewStats = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'orange' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals ?? pendingFiles.length, icon: Clock, color: 'yellow' },
    { label: 'Files Processed', value: stats?.filesProcessed || 0, icon: FileCheck, color: 'green' },
    { label: 'Admin Requests', value: stats?.adminRequests || 0, icon: Shield, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="stats-card">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/50`}>
                    <Icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const FileManagementContent = ({ theme }: { theme: 'light' | 'dark' }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('uploadedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedFile, setSelectedFile] = useState<PendingFile | null>(null);

    const { data: pendingFiles = [] } = useQuery<PendingFile[]>({ queryKey: ["/api/files/pending"] });

    // Mutations
    const approveFileMutation = useMutation({
        mutationFn: (fileId: string) => apiRequest("PATCH", `/api/files/${fileId}/approve`),
        onSuccess: () => {
            toast({ title: "File approved" });
            queryClient.invalidateQueries({ queryKey: ["/api/files/pending"] });
        },
        onError: () => toast({ title: "Error approving file", variant: "destructive" })
    });

    const rejectFileMutation = useMutation({
        mutationFn: (fileId: string) => apiRequest("PATCH", `/api/files/${fileId}/reject`),
        onSuccess: () => {
            toast({ title: "File rejected" });
            queryClient.invalidateQueries({ queryKey: ["/api/files/pending"] });
        },
        onError: () => toast({ title: "Error rejecting file", variant: "destructive" })
    });

    const filteredAndSortedFiles = pendingFiles
        .filter(file => file.originalName.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aValue = sortBy === 'uploadedAt' ? new Date(a.uploadedAt).getTime() : a.originalName;
            const bValue = sortBy === 'uploadedAt' ? new Date(b.uploadedAt).getTime() : b.originalName;
            return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });

    return (
        <Card className="shadow-sm dark:bg-gray-800">
            <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">File Approval Queue</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          placeholder="Search files..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-48 md:w-64"
                        />
                      </div>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uploadedAt">Date</SelectItem>
                          <SelectItem value="originalName">Name</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                       {sortOrder === 'asc' ? '↑' : '↓'}
                      </Button>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">{file.originalName}</TableCell>
                          <TableCell>User {file.userId.slice(0, 8)}...</TableCell>
                          <TableCell>{new Date(file.uploadedAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                             <Button
                                onClick={() => approveFileMutation.mutate(file.id)}
                                disabled={approveFileMutation.isPending}
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                             >
                               <Check size={16} />
                             </Button>
                             <Button
                                onClick={() => rejectFileMutation.mutate(file.id)}
                                disabled={rejectFileMutation.isPending}
                                size="sm"
                                variant="destructive"
                             >
                               <X size={16} />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredAndSortedFiles.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileCheck className="mx-auto mb-2" size={48} />
                      <p>No pending files found.</p>
                    </div>
                  )}
            </CardContent>
        </Card>
    );
};

const UserManagementContent = ({ theme, searchTerm, setSearchTerm, sortBy, setSortBy, sortOrder, setSortOrder }: {
  theme: 'light' | 'dark',
  searchTerm: string,
  setSearchTerm: (value: string) => void,
  sortBy: string,
  setSortBy: (value: string) => void,
  sortOrder: 'asc' | 'desc',
  setSortOrder: (value: 'asc' | 'desc') => void
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery<User[]>({ queryKey: ["/api/users"] });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "User role updated", description: "User role has been changed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Error updating user role", description: error.message, variant: "destructive" });
    },
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-green-100 text-green-800";
      case "superadmin": return "bg-orange-100 text-orange-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <Card className="shadow-sm dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">User Management</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-48 md:w-64"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
             {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      <Users className="text-gray-600" size={14} />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const SettingsContent = ({ theme, setTheme }: { theme: string, setTheme: Function }) => (
  <Card className="shadow-sm dark:bg-gray-800">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes.</p>
            </div>
            <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} variant="outline" size="icon">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
);

const PlaceholderContent = ({ title }: { title: string }) => (
  <Card className="shadow-sm dark:bg-gray-800">
    <CardContent className="p-6">
       <div className="text-center py-20 text-gray-400">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{title}</h3>
          <p className="text-sm">Advanced features and detailed views coming soon...</p>
       </div>
    </CardContent>
  </Card>
);
