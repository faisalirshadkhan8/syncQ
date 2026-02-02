import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Building2, Component, Settings, LogOut, Calendar, Bell, Sparkles, FileText, Webhook, Download } from 'lucide-react';
import { cn } from '@/utils/cn';
import useAuthStore from '@/stores/useAuthStore';

// eslint-disable-next-line no-unused-vars
const NavItem = ({ to, icon: Icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
          "hover:bg-white/10 hover:text-white",
          isActive
            ? "bg-white/20 text-white shadow-inner font-semibold"
            : "text-teal-100/80 border border-transparent"
        )
      }
    >
      <Icon size={18} className="group-hover:scale-110 transition-transform duration-200" />
      <span className="font-bold text-sm flex-1">{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white/20 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

const NavSection = ({ title, children }) => (
  <div className="space-y-1">
    {title && (
      <p className="px-3 py-2 text-xs font-semibold text-teal-200/50 uppercase tracking-wider">
        {title}
      </p>
    )}
    {children}
  </div>
);

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-[#005149] text-white shadow-xl">
      <div className="flex h-full flex-col px-4 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-6">
          <img src="/src/assets/synq.png" alt="syncQ Logo" className="h-24 w-auto object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto">
          {/* Main */}
          <NavSection>
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          </NavSection>

          {/* Job Search */}
          <NavSection title="Job Search">
            <NavItem to="/applications" icon={Briefcase} label="Applications" />
            <NavItem to="/companies" icon={Building2} label="Companies" />
            <NavItem to="/resumes" icon={FileText} label="Resumes" />
            <NavItem to="/interviews" icon={Calendar} label="Interviews" />
            <NavItem to="/notifications" icon={Bell} label="Notifications" />
          </NavSection>

          {/* AI Tools */}
          <NavSection title="AI Tools">
            <NavItem to="/ai/cover-letter" icon={Sparkles} label="Cover Letter" />
            <NavItem to="/ai/job-match" icon={Sparkles} label="Job Match" />
            <NavItem to="/ai/interview-questions" icon={Sparkles} label="Questions" />
          </NavSection>

          {/* Integrations */}
          <NavSection title="Integrations">
            <NavItem to="/webhooks" icon={Webhook} label="Webhooks" />
            <NavItem to="/exports" icon={Download} label="Export Data" />
          </NavSection>

          {/* Dev Tools */}
          <NavSection title="Developer">
            <NavItem to="/components" icon={Component} label="Design System" />
          </NavSection>
        </nav>

        {/* Settings & Logout */}
        <div className="space-y-1 mt-auto pt-6 border-t border-white/10">
          <NavItem to="/settings" icon={Settings} label="Settings" />
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
