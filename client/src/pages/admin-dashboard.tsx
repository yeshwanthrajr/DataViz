import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Users, FileSpreadsheet, TrendingUp, LogOut, Database, Settings,
  Check, X, Eye, Clock, Search, Menu, X as CloseIcon, Moon, Sun, Activity, FileCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import "./dashboard-layout.css";

// --- Data Interfaces ---
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

// --- Main Dashboard Component ---
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState('Overview');

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
        return <PlaceholderContent title="User Management" />;
      case 'Analytics':
        return <PlaceholderContent title="Analytics" />;
      case 'Settings':
        return <SettingsContent theme={theme} setTheme={setTheme} />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className={`dashboard-container ${theme}`}>
      {/* --- Sidebar --- */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="dashboard-logo">
            <div className="logo-icon">DV</div>
            <span className="logo-text">dataviz</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <CloseIcon size={20} />
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
                className="lg:hidden"
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
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="user-info">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200" data-testid="user-name">
                  {user?.name || 'Admin User'}
                </span>
                <Badge variant="outline" className="role-badge">Admin</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* --- Content Area --- */}
        <div className="dashboard-content">
          <div className="dashboard-content-inner">
            {renderContent()}
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
  const { data: stats } = useQuery<AdminStats>({ queryKey: ["/api/stats/admin"] });
  const { data: pendingFiles = [] } = useQuery<PendingFile[]>({ queryKey: ["/api/files/pending"] });

  const overviewStats = [
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: Users, color: 'green' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals ?? pendingFiles.length, icon: Clock, color: 'yellow' },
    { label: 'Files This Month', value: stats?.monthlyFiles || 0, icon: FileSpreadsheet, color: 'blue' },
    { label: 'Charts Generated', value: stats?.chartsGenerated || 0, icon: TrendingUp, color: 'purple' },
    { label: 'Storage Used', value: stats?.storageUsed || "0 GB", icon: Database, color: 'yellow' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
