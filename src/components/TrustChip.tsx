import React from 'react';
import { TrustStatus } from '../engine/types';
import { ShieldCheck, AlertCircle, Clock, HelpCircle } from 'lucide-react';

interface TrustChipProps {
  status: TrustStatus;
  label: string;
  detail?: string;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const TrustChip: React.FC<TrustChipProps> = ({
  status,
  label,
  detail,
  size = 'md',
  onClick
}) => {
  const getTheme = () => {
    switch (status) {
      case 'KNOWN':
        return {
          bg: 'bg-[#1E2512] border-[#C8DC35]/40 text-[#D4E83E]',
          dot: 'bg-[#C8DC35]',
          icon: ShieldCheck
        };
      case 'PROBABLE':
        return {
          bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          icon: Clock
        };
      case 'OUTDATED':
        return {
          bg: 'bg-[#2A1215] border-[#DC2626]/40 text-rose-300',
          dot: 'bg-[#DC2626]',
          icon: AlertCircle
        };
      case 'UNKNOWN':
      default:
        return {
          bg: 'bg-zinc-900 border-zinc-700 text-zinc-400',
          dot: 'bg-zinc-500',
          icon: HelpCircle
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-all ${
        theme.bg
      } ${size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'} ${
        onClick ? 'cursor-pointer hover:brightness-125' : ''
      }`}
      title={detail || label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
      <span className="font-medium tracking-tight">{label}</span>
    </div>
  );
};

