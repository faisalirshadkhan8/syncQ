import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';

const MarketingNavbar = () => {
    return (
        <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 h-32 flex items-center justify-between">
                {/* Logo - Image Only (Text is in image) */}
                <Link to="/" className="flex items-center">
                    <img src="/src/assets/synq.png" alt="syncQ Logo" className="h-30 w-auto object-contain" />
                </Link>

                {/* Middle Navigation */}
                <div className="hidden lg:flex items-center gap-10">
                    <Link to="/features" className="text-base font-semibold text-slate-900 hover:text-teal-brand-700 transition-colors">
                        AI Resume Builder
                    </Link>
                    <Link to="/dashboard" className="text-base font-semibold text-slate-900 hover:text-teal-brand-700 transition-colors">
                        Job Tracker
                    </Link>

                    {/* Tools Dropdown */}
                    <div className="group relative flex items-center gap-1 cursor-pointer py-4">
                        <span className="text-base font-semibold text-slate-900 group-hover:text-teal-brand-700 transition-colors">Tools</span>
                        <ChevronDown size={16} className="text-slate-500 group-hover:text-teal-brand-700 transition-colors" />

                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                            <Link to="/features" className="block px-4 py-3 hover:bg-slate-50 rounded-lg">
                                <div className="text-sm font-bold text-slate-900">Feature Overview</div>
                                <div className="text-xs text-slate-500">See all our tools</div>
                            </Link>
                            <Link to="/pricing" className="block px-4 py-3 hover:bg-slate-50 rounded-lg">
                                <div className="text-sm font-bold text-slate-900">Pricing</div>
                                <div className="text-xs text-slate-500">Plans for every stage</div>
                            </Link>
                        </div>
                    </div>

                    {/* Resources Dropdown */}
                    <div className="group relative flex items-center gap-1 cursor-pointer py-4">
                        <span className="text-base font-semibold text-slate-900 group-hover:text-teal-brand-700 transition-colors">Resources</span>
                        <ChevronDown size={16} className="text-slate-500 group-hover:text-teal-brand-700 transition-colors" />

                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-slate-100 shadow-xl rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0">
                            <Link to="/how-it-works" className="block px-4 py-3 hover:bg-slate-50 rounded-lg">
                                <div className="text-sm font-bold text-slate-900">How It Works</div>
                                <div className="text-xs text-slate-500">Guide to the platform</div>
                            </Link>
                            <div className="px-4 py-3">
                                <div className="text-sm font-bold text-slate-900">Blog</div>
                                <div className="text-xs text-slate-500">Coming soon</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-6 py-2.5 rounded-full border border-slate-300 text-slate-900 font-bold text-sm hover:border-slate-800 hover:bg-slate-50 transition-all">
                        Log in
                    </Link>
                    <Link to="/register">
                        <Button className="px-6 py-2.5 rounded-full bg-teal-brand-600 hover:bg-teal-brand-700 text-white font-bold text-sm shadow-lg shadow-teal-brand-900/10 border-none">
                            Sign up
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default MarketingNavbar;
