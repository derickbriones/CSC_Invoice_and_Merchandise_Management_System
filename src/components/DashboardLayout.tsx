import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import cscLogo from '@/assets/csc-logo.png';
import { LogOut, Menu, Sun, Moon, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
}

const DashboardLayout = ({ children, navItems, title }: DashboardLayoutProps) => {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/student' || path === '/staff' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 lg:w-64`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-0">
              <img src={cscLogo} alt="CSC" className="w-10 h-10 object-contain flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-bold text-sm text-sidebar-foreground">BU POLANGUI</h2>
                <p className="text-[11px] text-sidebar-foreground/60">{title}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto text-sidebar-foreground/60 hover:text-sidebar-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={() => setShowSignOutDialog(true)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-bold text-card-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            </button>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-card-foreground leading-tight">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-[11px] text-muted-foreground">{profile?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="text-xs font-bold text-primary-foreground">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
