import React from 'react';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import { Briefcase, BarChart2, Zap, Shield, Globe, Users } from 'lucide-react';

const Features = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <MarketingNavbar />

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features for Your Job Search</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Everything you need to organize, track, and land your next role.
                    </p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12">
                    <FeatureBlock
                        icon={Briefcase}
                        title="Application Tracking"
                        desc="Drag-and-drop Kanban boards to manage every application from applied to offer."
                    />
                    <FeatureBlock
                        icon={BarChart2}
                        title="Advanced Analytics"
                        desc="Visualize your funnel. See where you are getting stuck and optimize your strategy."
                    />
                    <FeatureBlock
                        icon={Zap}
                        title="AI Automation"
                        desc="Auto-generate cover letters and resume bullets tailored to specific job descriptions."
                    />
                    <FeatureBlock
                        icon={Shield}
                        title="Privacy First"
                        desc="Your data is yours. We don't sell your info to recruiters. Secure and private."
                    />
                    <FeatureBlock
                        icon={Globe}
                        title="Browser Extension"
                        desc="Save jobs from LinkedIn, Indeed, and more with a single click."
                    />
                    <FeatureBlock
                        icon={Users}
                        title="Interview Prep"
                        desc="Store common questions and track your answers for every interview."
                    />
                </div>
            </section>
        </div>
    );
};

// eslint-disable-next-line no-unused-vars
const FeatureBlock = ({ icon: Icon, title, desc }) => (
    <div className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-teal-brand-200 hover:shadow-lg transition-all">
        <div className="w-12 h-12 rounded-xl bg-teal-brand-50 text-teal-brand-700 flex items-center justify-center mb-4">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

export default Features;
