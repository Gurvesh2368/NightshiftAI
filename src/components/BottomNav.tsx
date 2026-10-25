import React from 'react';
import { Home, Compass, AlertTriangle, Users, User } from 'lucide-react';

export type NavTab = 'home' | 'nearby' | 'help' | 'area' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  sosActive?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  sosActive
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'nearby' as NavTab, label: 'Nearby', icon: Compass },
    {
      id: 'help' as NavTab,
      label: 'SOS Help',
      icon: AlertTriangle,
      isEmergency: true
    },
    { id: 'area' as NavTab, label: 'Area', icon: Users },
    { id: 'profile' as NavTab, label: 'Profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1210]/95 backdrop-blur-md border-t border-[#2C342A] pb-safe">
      <nav className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5 h-16">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isEmergency) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 rounded-2xl transition-all ${
                  sosActive
                    ? 'bg-[#DC2626] text-white animate-bounce ring-2 ring-red-400'
                    : isActive
                    ? 'bg-[#2A1215] text-red-400 border border-red-500/50'
                    : 'text-red-400 hover:text-red-300'
                }`}
                aria-label="Emergency Help Tab"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">
                  SOS
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#C8DC35] font-bold'
                  : 'text-[#9BA398] hover:text-[#F4F6F2]'
              }`}
              aria-label={`${tab.label} Tab`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-950/60 border border-emerald-500/30' : ''
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

