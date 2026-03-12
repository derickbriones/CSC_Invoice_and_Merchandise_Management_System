import { LucideIcon } from 'lucide-react';

interface StakeholderCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant: 'blue' | 'orange';
  onClick: () => void;
  delay?: number;
}

const StakeholderCard = ({ 
  icon: Icon, 
  title, 
  description, 
  variant, 
  onClick,
  delay = 0 
}: StakeholderCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`stakeholder-card ${
        variant === 'orange' ? 'stakeholder-card-orange' : 'stakeholder-card-blue'
      } animate-fade-in w-full h-full`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-xs opacity-90 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default StakeholderCard;
