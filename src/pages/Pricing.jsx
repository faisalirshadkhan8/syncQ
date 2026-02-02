import React from 'react';
import MarketingNavbar from '@/components/layout/MarketingNavbar';
import Button from '@/components/ui/Button';
import { Check } from 'lucide-react';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <MarketingNavbar />

            <section className="py-20 text-center">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
                        Start for free, upgrade for power features.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Free Tier */}
                        <PricingCard
                            title="Free"
                            price="$0"
                            features={['50 Active Applications', 'Basic Kanban Board', 'Chrome Extension limited']}
                            cta="Get Started"
                        />
                        {/* Pro Tier */}
                        <PricingCard
                            title="Pro"
                            price="$12"
                            period="/month"
                            highlight={true}
                            features={['Unlimited Applications', 'AI Resume Builder', 'Advanced Analytics', 'Priority Support']}
                            cta="Start Free Trial"
                        />
                        {/* Team Tier */}
                        <PricingCard
                            title="Team"
                            price="$49"
                            period="/month"
                            features={['Everything in Pro', 'Collaborative Boards', 'Team Analytics', 'Admin Dashboard']}
                            cta="Contact Sales"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const PricingCard = ({ title, price, period, features, cta, highlight }) => (
    <div className={`p-8 rounded-2xl border ${highlight ? 'border-teal-brand-500 shadow-xl relative overflow-hidden' : 'border-slate-200 hover:shadow-lg transition-shadow'} bg-white text-left`}>
        {highlight && <div className="absolute top-0 inset-x-0 h-1 bg-teal-brand-500" />}
        <h3 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h3>
        <div className="flex items-baseline mb-6">
            <span className="text-4xl font-bold text-slate-900">{price}</span>
            {period && <span className="text-slate-500 ml-1">{period}</span>}
        </div>
        <ul className="space-y-4 mb-8">
            {features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check size={18} className="text-teal-brand-600 mt-0.5 shrink-0" />
                    <span className="text-sm">{feat}</span>
                </li>
            ))}
        </ul>
        <Button
            className={`w-full ${highlight ? 'bg-teal-brand-700 hover:bg-teal-brand-800 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
        >
            {cta}
        </Button>
    </div>
);

export default Pricing;
