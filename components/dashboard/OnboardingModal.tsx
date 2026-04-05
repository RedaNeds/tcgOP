'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Search, TrendingUp, Bell, X } from 'lucide-react';

interface OnboardingModalProps {
    isFirstTime: boolean;
}

export function OnboardingModal({ isFirstTime }: OnboardingModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const router = useRouter();

    const hasLoaded = typeof window !== 'undefined';

    useEffect(() => {
        if (isFirstTime) {
            const hasSeen = localStorage.getItem('hasSeenOnboarding');
            if (!hasSeen) {
                const timer = setTimeout(() => setIsOpen(true), 800);
                return () => clearTimeout(timer);
            }
        }
    }, [isFirstTime]);

    if (!hasLoaded || !isOpen) return null;

    const steps = [
        {
            icon: <Sparkles className="text-yellow-400" size={28} />,
            title: 'Welcome to OPTCG Tracker! 🎉',
            description: 'Your personal One Piece TCG portfolio manager. Track your collection value, monitor prices, and never miss a deal.',
            color: 'from-yellow-500/10 to-orange-500/10',
        },
        {
            icon: <Search className="text-blue-400" size={28} />,
            title: 'Add your first cards',
            description: 'Click "Add Asset" on the dashboard or browse the Card Catalog to find and add cards to your portfolio.',
            color: 'from-blue-500/10 to-cyan-500/10',
        },
        {
            icon: <TrendingUp className="text-green-400" size={28} />,
            title: 'Track performance',
            description: 'Watch your portfolio value change in real-time. See which cards are gaining value and which are dropping.',
            color: 'from-green-500/10 to-emerald-500/10',
        },
        {
            icon: <Bell className="text-purple-400" size={28} />,
            title: 'Set price alerts',
            description: 'Add cards to your Wishlist with a target price. You\'ll be notified when prices drop to your target.',
            color: 'from-purple-500/10 to-pink-500/10',
        },
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    const handleClose = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setIsOpen(false);
    };

    const handleNext = () => {
        if (isLastStep) {
            handleClose();
        } else {
            setStep(step + 1);
        }
    };

    const handleGoToCatalog = () => {
        handleClose();
        router.push('/cards');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Progress bar */}
                <div className="h-1 bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    {/* Close button */}
                    <div className="flex justify-end -mt-2 -mr-2 mb-2">
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className={`bg-gradient-to-br ${currentStep.color} rounded-2xl p-6 mb-6 flex items-center justify-center`}>
                        <div className="w-14 h-14 rounded-2xl bg-background/80 flex items-center justify-center">
                            {currentStep.icon}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mb-2">{currentStep.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                        {currentStep.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-secondary transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <div className="flex-1" />
                        {isLastStep ? (
                            <button
                                onClick={handleGoToCatalog}
                                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                            >
                                Browse Cards
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                            >
                                Next
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>

                    {/* Step dots */}
                    <div className="flex justify-center gap-1.5 mt-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
