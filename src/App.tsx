import React, { useState, useEffect } from 'react';
import { TripPlan, PlanMode } from './engine/types';
import { INITIAL_PLANS, MOCK_PLACES } from './data/mockScenario';
import { offlineDb } from './lib/db';
import { SupportedLang, tts } from './lib/tts';

// Components
import { BottomNav, NavTab } from './components/BottomNav';
import { StatusBanner } from './components/StatusBanner';

// Screens
import { AuthScreen } from './screens/AuthScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CheckinScreen } from './screens/CheckinScreen';
import { NavigateScreen } from './screens/NavigateScreen';
import { NearbyScreen } from './screens/NearbyScreen';
import { HelpScreen } from './screens/HelpScreen';
import { SosActiveScreen } from './screens/SosActiveScreen';
import { OfflineScreen } from './screens/OfflineScreen';
import { AreaScreen } from './screens/AreaScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ReadAloudScreen } from './screens/ReadAloudScreen';
import { ContactAlertPage } from './screens/ContactAlertPage';

export const App: React.FC = () => {
  // Check if opened as family member via live tracking link
  const isFamilyAlertView = typeof window !== 'undefined' && window.location.search.includes('view=contact_alert');

  // User Session & Setup
  const [user, setUser] = useState<any>(() => {
    if (isFamilyAlertView) {
      return { id: 'family_guest', name: 'Family Member', isFamily: true };
    }
    const saved = localStorage.getItem('nightshift_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return isFamilyAlertView || localStorage.getItem('nightshift_onboarded') === 'true';
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    return isFamilyAlertView ? 'contact_alert' : 'home';
  });

  // Plans & Simulation State
  const [plans, setPlans] = useState<TripPlan[]>(INITIAL_PLANS);
  const [selectedMode, setSelectedMode] = useState<PlanMode>('safest');
  const [selectedPlanForNav, setSelectedPlanForNav] = useState<TripPlan>(INITIAL_PLANS[0]);

  // Status & Alerts
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [replanReason, setReplanReason] = useState<string | null>(null);

  // Language & Accessibility
  const [lang, setLang] = useState<SupportedLang>('en');

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cache initial plans to IndexedDB
    try {
      INITIAL_PLANS.forEach(p => {
        offlineDb.cachedTrips.put({
          id: p.id,
          mode: p.mode,
          plan: p,
          fetchedAt: Date.now()
        });
      });
      MOCK_PLACES.forEach(pl => {
        offlineDb.offlinePlaces.put(pl);
      });
    } catch (e) {
      console.warn('Dexie cache init error:', e);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Tab Change
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('home');
    else if (tab === 'nearby') setCurrentScreen('nearby');
    else if (tab === 'help') setCurrentScreen(sosActive ? 'sos_active' : 'help');
    else if (tab === 'area') setCurrentScreen('area');
    else if (tab === 'profile') setCurrentScreen('profile');
  };

  // Auth & Onboarding Handlers
  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    localStorage.setItem('nightshift_user', JSON.stringify(authUser));
    if (!isOnboarded) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleOnboardingComplete = (profileData: any) => {
    setIsOnboarded(true);
    localStorage.setItem('nightshift_onboarded', 'true');
    setLang(profileData.language || 'en');
    setCurrentScreen('home');
  };

  // Event Simulation Handler (for hackathon testing & evaluators)
  const handleSimulateEvent = (eventType: string) => {
    if (eventType === 'bus_cancel') {
      // Replace Safest plan with auto-stand fallback
      setPlans(prev =>
        prev.map(p => {
          if (p.mode === 'safest') {
            return {
              ...p,
              name: 'Prepaid Auto Stand Fallback',
              summary: 'Direct Night Auto via illuminated Eastern Link',
              safetyScore: 78,
              overallStatus: 'PROBABLE',
              statusChip: {
                status: 'PROBABLE',
                label: 'Rerouted Fallback',
                detail: 'Bus 109 cancelled; switched to staffed auto booth'
              },
              whyThisScore: [
                'Prepaid booth with municipal security guard present',
                'Avoids waiting at dark stop after bus cancellation',
                'Arrives at 02:35 AM'
              ]
            };
          }
          return p;
        })
      );
      setReplanReason(
        'Bus 109 cancelled at depot. Automatically rerouted to well-lit 24/7 Prepaid Auto Stand.'
      );
      if (tts) {
        tts.speak('Notice: Bus 109 cancelled. Automatically rerouted to prepaid auto stand.', {
          lang
        });
      }
    } else if (eventType === 'rain_storm') {
      setPlans(prev =>
        prev.map(p => ({
          ...p,
          safetyScore: Math.max(50, p.safetyScore - 12),
          whyThisScore: [
            'Heavy rain advisory in effect — roads slippery',
            ...p.whyThisScore
          ]
        }))
      );
      setReplanReason('Heavy rain storm detected. Safety scores adjusted for road wetness.');
    } else if (eventType === 'telemetry_down') {
      // Test the UNKNOWN CAP 60 rule from TRD & Vitest!
      setPlans(prev =>
        prev.map(p => {
          if (p.mode === 'safest') {
            return {
              ...p,
              safetyScore: 60,
              scoreCapReason: 'Limited data: Critical transit telemetry is UNKNOWN',
              overallStatus: 'UNKNOWN',
              statusChip: {
                status: 'UNKNOWN',
                label: 'Feed Down (Unknown)',
                detail: 'No recent GPS ping received from transit authority'
              },
              whyThisScore: [
                'Score capped at 60 due to missing verified telemetry',
                'Do not rely on schedule without live visual confirmation'
              ]
            };
          }
          return p;
        })
      );
      setReplanReason('Transit telemetry feed down. Safety score strictly capped at 60 (honest uncertainty).');
    } else if (eventType === 'reset') {
      setPlans(INITIAL_PLANS);
      setReplanReason(null);
    }
  };

  // SOS Trigger
  const triggerSos = () => {
    setSosActive(true);
    setCurrentScreen('sos_active');
    setActiveTab('help');
    if (tts) {
      tts.speak('SOS Alert triggered. Emergency contacts notified.', { lang });
    }
  };

  const cancelSos = () => {
    setSosActive(false);
    setCurrentScreen('home');
    setActiveTab('home');
    if (tts) {
      tts.speak('Alert cancelled. Marked safe.', { lang });
    }
  };

  // Screen Routing Logic
  if (!user && currentScreen !== 'contact_alert') {
    return (
      <AuthScreen
        onSuccess={handleAuthSuccess}
        onContinueGuest={() => {
          handleAuthSuccess({ id: 'guest_worker', phone: '+91 99999 88888', isGuest: true });
        }}
      />
    );
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#18191B] text-[#ECEEF3] flex flex-col font-sans">
      {/* Top 4px Aesthetic Gradient Bar */}
      <div className="gradient-bar w-full fixed top-0 left-0 right-0 z-50" />

      {/* Persistent Status Banner for Offline, SOS, or Replan */}
      <div className="pt-1 fixed top-0 left-0 right-0 z-40">
        <StatusBanner
          isOffline={isOffline}
          sosActive={sosActive}
          replanReason={replanReason}
          onDismissReplan={() => setReplanReason(null)}
          onNavigateSos={() => {
            setCurrentScreen('sos_active');
            setActiveTab('help');
          }}
        />
      </div>

      {/* Main Screen Router */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeScreen
            plans={plans}
            selectedMode={selectedMode}
            onSelectMode={setSelectedMode}
            onStartCheckin={plan => {
              setSelectedPlanForNav(plan);
              setCurrentScreen('checkin');
            }}
            onSimulateEvent={handleSimulateEvent}
            lang={lang}
          />
        )}

        {currentScreen === 'checkin' && (
          <CheckinScreen
            plan={selectedPlanForNav}
            onConfirmSafe={() => setCurrentScreen('navigate')}
            onTriggerSos={triggerSos}
            onOpenNearby={filter => {
              setCurrentScreen('nearby');
              setActiveTab('nearby');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'navigate' && (
          <NavigateScreen
            plan={selectedPlanForNav}
            lang={lang}
            onArriveHome={() => {
              alert('🎉 Welcome home safely! Safe-arrival timer disarmed.');
              setCurrentScreen('home');
            }}
            onTriggerSos={triggerSos}
            onReplan={reason => setReplanReason(reason)}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'nearby' && (
          <NearbyScreen
            onNavigateToPlace={place => {
              alert(`Navigating to ${place.name} (${place.opening_hours})`);
              setCurrentScreen('navigate');
            }}
          />
        )}

        {currentScreen === 'help' && (
          <HelpScreen onTriggerSos={triggerSos} />
        )}

        {currentScreen === 'sos_active' && (
          <SosActiveScreen
            onCancelSafe={cancelSos}
            onOpenLiveAlertLink={() => setCurrentScreen('contact_alert')}
          />
        )}

        {currentScreen === 'offline' && (
          <OfflineScreen
            plan={selectedPlanForNav}
            onReconnect={() => setIsOffline(!navigator.onLine)}
            onSendSmsSos={triggerSos}
          />
        )}

        {currentScreen === 'area' && <AreaScreen />}

        {currentScreen === 'profile' && (
          <ProfileScreen
            userProfile={user}
            onUpdateProfile={u => setUser(u)}
            onSignOut={() => {
              setUser(null);
              setIsOnboarded(false);
              localStorage.removeItem('nightshift_user');
              localStorage.removeItem('nightshift_onboarded');
            }}
          />
        )}

        {currentScreen === 'read_aloud' && (
          <ReadAloudScreen
            lang={lang}
            onChangeLang={setLang}
          />
        )}

        {currentScreen === 'contact_alert' && (
          <ContactAlertPage
            workerName={user?.phone || 'Night Worker'}
            onBackToApp={() => {
              setCurrentScreen('home');
              setActiveTab('home');
            }}
          />
        )}
      </main>

      {/* Bottom Navigation (Hidden only during live navigation or full-screen contact alert) */}
      {currentScreen !== 'navigate' && currentScreen !== 'contact_alert' && (
        <BottomNav
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          sosActive={sosActive}
        />
      )}
    </div>
  );
};

export default App;
