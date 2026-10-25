import React from 'react';
import { WifiOff, AlertOctagon, RefreshCw, X } from 'lucide-react';

interface StatusBannerProps {
  isOffline?: boolean;
  sosActive?: boolean;
  replanReason?: string | null;
  onDismissReplan?: () => void;
  onNavigateSos?: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  isOffline,
  sosActive,
  replanReason,
  onDismissReplan,
  onNavigateSos
}) => {
  if (sosActive) {
    return (
      <div
        onClick={onNavigateSos}
        className="cursor-pointer bg-gradient-to-r from-red-600 to-rose-700 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-md animate-pulse"
      >
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 shrink-0" />
          <span>SOS ALERT ACTIVE · Emergency contacts notified · Tap to manage</span>
        </div>
        <span className="underline text-xs">View</span>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="bg-amber-950/90 border-b border-amber-600/40 text-amber-200 px-4 py-2 flex items-center gap-2 text-xs font-medium">
        <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          Offline mode active · Showing cached trip & map tiles with OUTDATED trust chips
        </span>
      </div>
    );
  }

  if (replanReason) {
    return (
      <div className="bg-sky-950/90 border-b border-sky-600/40 text-sky-200 px-4 py-2.5 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-sky-400 shrink-0 animate-spin" />
          <span>
            <strong className="text-sky-300">Live Replan:</strong> {replanReason}
          </span>
        </div>
        {onDismissReplan && (
          <button onClick={onDismissReplan} className="text-sky-300 hover:text-white ml-2">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return null;
};

