import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { ChartLine, FileSpreadsheet, CheckCircle, Clock, BarChart, LogOut, Clock4, Home, Upload, TrendingUp, Settings, Bell, Moon, Sun, Menu, X } from "lucide-react";
import FileUpload from "@/components/file-upload";
import ChartGenerator from "@/components/chart-generator";
import ChartsList from "@/components/charts-list";
import { useState } from "react";
import "./dashboard-layout.css";

interface Stats {
  totalUploads: number;
  approved: number;
  pending: number;
  charts: number;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats/dashboard"],
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`dashboard-container ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="dashboard-logo">
            <div className="logo-icon">
              <ChartLine size={16} />
            </div>
            <span className="logo-text">dataviz</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={16} />
          </Button>
        </div>

        <nav className="mt-8 px-4">
           {navigationItems.map((item) => {
             const Icon = item.icon;
             return (
               <div
                 key={item.id}
                 onClick={() => {
                   setActiveTab(item.id);
                   setSidebarOpen(false);
                 }}
                 className={`sidebar-nav-item ${
                   activeTab === item.id ? 'active' : ''
                 }`}
               >
                 <div className="icon">
                   <Icon size={20} />
                 </div>
                 <span className="label">{item.label}</span>
               </div>
             );
           })}
         </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="header-left">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mobile-menu-button"
              >
                <Menu size={20} />
              </Button>
              <div className="dashboard-logo">
                <div className="logo-icon">
                  <ChartLine size={16} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">dataviz</h1>
                  <span className="role-badge">Normal User Dashboard</span>
                </div>
              </div>
            </div>

            <div className="header-right">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="theme-selector px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>

              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="logout-button"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>

              <div className="user-info">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium" data-testid="user-name">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="dashboard-content-inner">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="dashboard-tabs">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="tab-content">
                <div className="content-section">
                  {/* Status Alert */}
                  <Card className="stats-card">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Clock4 className={`${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'} mr-3`} size={20} />
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'}`}>Approval Required</h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                            Your uploads require Super Admin approval before processing.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="stats-grid">
                  <Card className="stats-card">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                          <FileSpreadsheet className="text-blue-600" size={24} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Uploads</p>
                          <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} data-testid="stat-total-uploads">
                            {stats?.totalUploads || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="stats-card">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                          <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Approved</p>
                          <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} data-testid="stat-approved">
                            {stats?.approved || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="stats-card">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                          <Clock className="text-yellow-600" size={24} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                          <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} data-testid="stat-pending">
                            {stats?.pending || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="stats-card">
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-purple-900' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                          <BarChart className="text-purple-600" size={24} />
                        </div>
                        <div className="ml-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Charts Created</p>
                          <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} data-testid="stat-charts">
                            {stats?.charts || 0}
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
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
                      <div className="space-y-3">
                        <div className={`flex items-center p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                          <FileSpreadsheet className="text-blue-600 mr-3" size={16} />
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>File uploaded successfully</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>2 hours ago</p>
                          </div>
                        </div>
                        <div className={`flex items-center p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                          <BarChart className="text-green-600 mr-3" size={16} />
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chart generated</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>5 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="tab-content">
                <div className="content-section">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <FileUpload />
                    </div>
                    <div>
                      <ChartGenerator />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="tab-content">
                <div className="content-section">
                  <ChartsList />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="tab-content">
                <div className="content-section">
                  <Card className="stats-card">
                    <CardContent className="p-6">
                      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Toggle between light and dark themes</p>
                          </div>
                          <Button onClick={toggleTheme} variant="outline">
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                          </Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Receive notifications for file approvals</p>
                          </div>
                          <Badge variant="secondary">Coming Soon</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
