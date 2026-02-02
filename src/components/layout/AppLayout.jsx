import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    // Premium Page Transition
    // Triggers whenever location.pathname changes
    if (!mainRef.current) return;

    // Kill any active animations to prevent conflict
    gsap.killTweensOf(mainRef.current);

    // Fade up and unblur
    gsap.fromTo(mainRef.current,
      {
        y: 15,
        opacity: 0,
        filter: 'blur(8px)'
      },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.4,
        ease: 'power3.out',
        clearProps: 'all' // Cleanup to avoid stacking context issues
      }
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-brand-500/30 selection:text-teal-brand-900">
      <Sidebar />

      {/* Main Content Area - Offset by sidebar width */}
      <div className="pl-64 flex flex-col min-h-screen">
        <Header title={getPageTitle(location.pathname)} />

        {/* Key ensures React remounts/refreshes, ref target for GSAP */}
        <main ref={mainRef} key={location.pathname} className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Helper for dynamic header titles based on route
function getPageTitle(path) {
  if (path.includes('dashboard')) return 'Dashboard';
  if (path.includes('applications')) return 'Applications';
  if (path.includes('components')) return 'Component Gallery';
  if (path.includes('settings')) return 'Settings';
  if (path.includes('design-system')) return 'Design System';
  return 'syncQ';
}
