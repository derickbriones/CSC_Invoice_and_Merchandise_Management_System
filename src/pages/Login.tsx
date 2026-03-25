import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, GraduationCap, Wallet, Settings } from 'lucide-react';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import cscLogo from '@/assets/csc-logo.png';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleConfig = {
  student: { title: 'Student', icon: GraduationCap, description: 'Access merchandise and view your orders', dashboardPath: '/student' },
  staff: { title: 'CSC Staff / Finance Team', icon: Wallet, description: 'Manage invoices and inventory', dashboardPath: '/staff' },
  admin: { title: 'System Administrator', icon: Settings, description: 'Full system access and management', dashboardPath: '/admin' },
};

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get('role') as keyof typeof roleConfig) || 'student';
  const config = roleConfig[role] || roleConfig.student;
  const Icon = config.icon;

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in email and password'); return; }
    if (isSignUp && (!firstName || !lastName)) { toast.error('Please fill in your name'); return; }
    setIsLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, firstName, lastName, role as AppRole, studentId || undefined, yearLevel ? parseInt(yearLevel) : undefined, course || undefined);
      if (error) {
        toast.error(error.message?.includes('already registered') ? 'This email is already registered. Please sign in.' : error.message || 'Sign up failed');
      } else {
        toast.success('Account created! Please check your email to verify, then sign in.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message || 'Sign in failed');
      } else {
        toast.success('Welcome back!');
        const { data: { user: signedInUser } } = await supabase.auth.getUser();
        if (signedInUser) {
          const { data: userRoles } = await supabase.from('user_roles').select('role').eq('user_id', signedInUser.id);
          const actualRole = userRoles?.[0]?.role;
          navigate({ student: '/student', staff: '/staff', admin: '/admin' }[actualRole || ''] || '/student');
        } else {
          navigate(config.dashboardPath);
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-page relative flex items-center justify-center p-4">
      <BackgroundDecorations />
      
      <div className="relative z-10 w-full max-w-md bg-card rounded-3xl shadow-2xl p-8 animate-fade-in">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to role selection</span>
        </Link>

        <div className="flex flex-col items-center mb-6">
          <img src={cscLogo} alt="CSC Logo" className="w-20 h-20 object-contain mb-4" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-3">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">{config.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-card-foreground text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1">{config.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Juan" className="login-input" disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dela Cruz" className="login-input" disabled={isLoading} />
                </div>
              </div>
              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Student ID</label>
                    <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="2024-00001" className="login-input" disabled={isLoading} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Course</label>
                      <input type="text" value={course} onChange={e => setCourse(e.target.value)} placeholder="BSIT" className="login-input" disabled={isLoading} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Year Level</label>
                      <input type="number" min="1" max="5" value={yearLevel} onChange={e => setYearLevel(e.target.value)} placeholder="1" className="login-input" disabled={isLoading} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="login-input" disabled={isLoading} />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="login-input pr-10" disabled={isLoading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="login-button disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <span className="font-bold">Need help?</span> Contact us!
        </p>
      </div>
    </div>
  );
};

export default Login;
