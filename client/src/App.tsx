import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import LoginPage from "@/pages/login";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import SuperAdminDashboard from "@/pages/super-admin-dashboard";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        {user ? (
          user.role === "superadmin" ? <SuperAdminDashboard /> :
          user.role === "admin" ? <AdminDashboard /> :
          <UserDashboard />
        ) : (
          <LoginPage />
        )}
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute allowedRoles={["user"]}>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/super-admin">
        <ProtectedRoute allowedRoles={["superadmin"]}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
