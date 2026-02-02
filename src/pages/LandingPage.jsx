import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart2, Briefcase, Shield, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
// Import the image we just copied
import heroImage from '@/assets/hero-dashboard.png';

import MarketingNavbar from '@/components/layout/MarketingNavbar';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <MarketingNavbar />

            {/* Hero Section */}
            <section className="pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-brand-50 text-teal-brand-700 border border-teal-brand-100/50 text-sm font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                </span>
                                v2.0 Now Available
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                                Track your career <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-brand-800 to-teal-brand-500">
                                    acceleration.
                                </span>
                            </h1>

                            <p className="text-xl text-slate-500 max-w-lg leading-relaxed">
                                The intelligent platform for ambitious professionals. Organize applications, prepare for interviews, and land your dream job faster.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/register">
                                    <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-teal-brand-900 hover:bg-teal-brand-800 text-white text-base shadow-xl shadow-teal-brand-900/20 border-none">
                                        Start Tracking Free <ArrowRight size={18} className="ml-2" />
                                    </Button>
                                </Link>
                                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-12 px-8 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                                    View Demo
                                </Button>
                            </div>

                            <div className="flex items-center gap-8 pt-8 text-sm text-slate-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-teal-brand-600" /> Free Forever
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-teal-brand-600" /> No Credit Card
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-teal-brand-600" /> Secure Data
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative animate-scale-up delay-200">
                            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-teal-brand-900/20 border border-slate-200/50 bg-white">
                                <img
                                    src={heroImage}
                                    alt="Dashboard Preview"
                                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                {/* Overlay gradient for shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                            </div>

                            {/* Decorative Blobs */}
                            <div className="absolute -top-20 -right-20 w-96 h-96 bg-teal-brand-100/50 rounded-full blur-3xl opacity-50 -z-10" />
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl opacity-50 -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to succeed</h2>
                        <p className="text-slate-500">Stop using spreadsheets. Upgrade to a purpose-built system designed for modern job hunting.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Briefcase}
                            title="Application Tracking"
                            description="Kanban-style boards to visualize your progress from applied to offered."
                        />
                        <FeatureCard
                            icon={BarChart2}
                            title="Analytics & Insights"
                            description="Visualize your conversion rates and identify bottlenecks in your process."
                        />
                        <FeatureCard
                            icon={Zap} // Or AI icon
                            title="AI-Powered Tools"
                            description="Smart suggestions for resumes and cover letters to boost your chances."
                        />
                    </div>
                </div>
            </section>

            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; 2026 syncQ. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-teal-brand-700">Privacy</a>
                        <a href="#" className="hover:text-teal-brand-700">Terms</a>
                        <a href="#" className="hover:text-teal-brand-700">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// eslint-disable-next-line no-unused-vars
const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-brand-100 transition-all duration-300 group">
        <div className="w-12 h-12 rounded-lg bg-teal-brand-50 text-teal-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
