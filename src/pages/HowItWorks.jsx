import React from 'react';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import { Download, List, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <MarketingNavbar />

            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">How syncQ Works</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Your personal career acceleration system in three simple steps.
                    </p>
                </div>
            </section>

            <section className="py-20 max-w-4xl mx-auto px-6">
                <div className="space-y-16">
                    <Step
                        num="01"
                        title="Install & Collect"
                        desc="Install the browser extension and save jobs from LinkedIn, Indeed, or any job board with one click. No more copy-pasting."
                        icon={Download}
                    />
                    <Step
                        num="02"
                        title="Track & Organize"
                        desc="Move applications across your drag-and-drop board. Keep track of interviews, notes, and dates in one place."
                        icon={List}
                    />
                    <Step
                        num="03"
                        title="Analyze & Optimize"
                        desc="Use our insights to see which resumes are working, where you're getting stuck, and improve your success rate."
                        icon={TrendingUp}
                    />
                </div>
            </section>
        </div>
    );
};

// eslint-disable-next-line no-unused-vars
const Step = ({ num, title, desc, icon: Icon }) => (
    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-teal-brand-900 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-brand-900/20">
            {num}
        </div>
        <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                {title}
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default HowItWorks;
