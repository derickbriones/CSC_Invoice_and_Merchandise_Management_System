import { useNavigate } from 'react-router-dom';
import { GraduationCap, Wallet, Settings } from 'lucide-react';
import BackgroundDecorations from '@/components/BackgroundDecorations';
import StakeholderCard from '@/components/StakeholderCard';
import cscLogo from '@/assets/csc-logo.png';

const Index = () => {
  const navigate = useNavigate();

  const handleStakeholderClick = (role: string) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <BackgroundDecorations />
      
      {/* Main Card */}
      <div className="relative z-10 w-full max-w-2xl bg-card rounded-3xl shadow-2xl p-8 sm:p-12 animate-fade-in">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src={cscLogo} 
            alt="CSC Logo" 
            className="w-24 h-24 object-contain mb-4 animate-float"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground text-center leading-tight">
            Invoice and Merchandise Management System
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Bicol University College Student Council
          </p>
        </div>

        {/* Description */}
        <p className="text-center text-muted-foreground text-sm mb-8 max-w-md mx-auto">
          Select your role to access the system. Manage invoices, merchandise, and transactions efficiently.
        </p>

        {/* Stakeholder Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
          <StakeholderCard
            icon={GraduationCap}
            title="Student"
            description="View & purchase merchandise"
            variant="blue"
            onClick={() => handleStakeholderClick('student')}
            delay={100}
          />
          <StakeholderCard
            icon={Wallet}
            title="CSC Staff"
            description="Finance & inventory"
            variant="orange"
            onClick={() => handleStakeholderClick('staff')}
            delay={200}
          />
          <StakeholderCard
            icon={Settings}
            title="Administrator"
            description="System management"
            variant="blue"
            onClick={() => handleStakeholderClick('admin')}
            delay={300}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © 2026 Bicol University. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
