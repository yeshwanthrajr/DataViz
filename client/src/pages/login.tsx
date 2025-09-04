import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { FiBarChart, FiUser } from 'react-icons/fi';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, user } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const demoCredentials = {
        user: { email: 'user@dataviz.com', pass: 'admin123' },
        admin: { email: 'admin@dataviz.com', pass: 'admin123' },
        superAdmin: { email: 'superadmin@dataviz.com', pass: 'admin123' },
    };

    // Redirect to dashboard when user is authenticated
    useEffect(() => {
        if (user) {
            // Navigate to the appropriate dashboard based on role
            if (user.role === "superadmin") {
                setLocation("/super-admin");
            } else if (user.role === "admin") {
                setLocation("/admin");
            } else {
                setLocation("/");
            }
        }
    }, [user, setLocation]);

    const handleAutoFill = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        userType: 'user' | 'admin' | 'superAdmin'
    ) => {
        e.preventDefault();
        setEmail(demoCredentials[userType].email);
        setPassword(demoCredentials[userType].pass);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast({
                title: "Welcome back!",
                description: "Successfully logged in",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Authentication failed",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <header className="login-header">
                    <div className="logo-icon-container">
                        <FiBarChart size={32} />
                    </div>
                    <h1>DataViz Pro</h1>
                    <p>Excel Analytics & Visualization Platform</p>
                </header>

                <main className="login-card">
                    <div className="login-card-header">
                        <h2>Sign In</h2>
                        <p>Access your dashboard</p>
                    </div>

                    <div className="demo-credentials">
                        <p className="demo-title">Demo Credentials</p>
                        <ul>
                            <li>
                                <span>User:</span>
                                <a href="#" onClick={(e) => handleAutoFill(e, 'user')}>
                                    user@dataviz.com / admin123
                                </a>
                            </li>
                            <li>
                                <span>Admin:</span>
                                <a href="#" onClick={(e) => handleAutoFill(e, 'admin')}>
                                    admin@dataviz.com / admin123
                                </a>
                            </li>
                            <li>
                                <span>Super Admin:</span>
                                <a href="#" onClick={(e) => handleAutoFill(e, 'superAdmin')}>
                                    superadmin@dataviz.com / admin123
                                </a>
                            </li>
                        </ul>
                        <p className="demo-instruction">Click any credential to auto-fill the form</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email or Username</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="e.g., yourname or you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="password-label-container">
                                <label htmlFor="password">Password</label>
                                <a href="#" className="forgot-password-link">Forgot your password?</a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="sign-in-button" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    <span>Signing In...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <FiUser className="mr-2" />
                                    <span>Sign In</span>
                                </div>
                            )}
                        </button>
                    </form>
                </main>
            </div>
            <div className="floating-logo">
                N
            </div>
        </div>
    );
};

export default Login;
