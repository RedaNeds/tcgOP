'use client';

import { Dispatch, SetStateAction } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Card, PortfolioItem } from '@/types';

const AddCardModal = dynamic(() => import('@/components/cards/AddCardModal').then((mod) => mod.AddCardModal), { ssr: false });
const CardDetailsModal = dynamic(() => import('@/components/cards/CardDetailsModal').then((mod) => mod.CardDetailsModal), { ssr: false });
const OnboardingModal = dynamic(() => import('@/components/dashboard/OnboardingModal').then((mod) => mod.OnboardingModal), { ssr: false });
const ConfirmModal = dynamic(() => import('@/components/ui/ConfirmModal').then((mod) => mod.ConfirmModal), { ssr: false });
const CardSearch = dynamic(() => import('@/components/cards/CardSearch').then((mod) => mod.CardSearch), { ssr: false });

interface DashboardModalsProps {
    isAddModalOpen: boolean;
    setIsAddModalOpen: Dispatch<SetStateAction<boolean>>;
    selectedCard: Card | null;
    setSelectedCard: Dispatch<SetStateAction<Card | null>>;
    confirmRemoveId: string | null;
    setConfirmRemoveId: Dispatch<SetStateAction<string | null>>;
    detailedItemId: string | null;
    setDetailedItemId: Dispatch<SetStateAction<string | null>>;
    items: PortfolioItem[];
    executeRemove: () => void;
}

export function DashboardModals({
    isAddModalOpen,
    setIsAddModalOpen,
    selectedCard,
    setSelectedCard,
    confirmRemoveId,
    setConfirmRemoveId,
    detailedItemId,
    setDetailedItemId,
    items,
    executeRemove,
}: DashboardModalsProps) {
    return (
        <>
            {isAddModalOpen && !selectedCard && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setIsAddModalOpen(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="search-modal-title"
                        className="w-full max-w-2xl glass rounded-[2.5rem] p-10 border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 id="search-modal-title" className="text-3xl font-black tracking-tighter">Locate Asset</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors" aria-label="Close search">
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <CardSearch onSelect={(card) => setSelectedCard(card)} />
                    </motion.div>
                </div>
            )}

            {selectedCard && (
                <AddCardModal
                    isOpen={!!selectedCard}
                    card={selectedCard}
                    onClose={() => {
                        setSelectedCard(null);
                        setIsAddModalOpen(false);
                    }}
                />
            )}

            <ConfirmModal
                isOpen={!!confirmRemoveId}
                title="Decommission Asset"
                message="Are you sure you want to remove this strategic asset from your arsenal?"
                confirmLabel="Confirm Removal"
                variant="danger"
                onConfirm={executeRemove}
                onCancel={() => setConfirmRemoveId(null)}
            />

            <CardDetailsModal
                isOpen={!!detailedItemId}
                item={items.find((i) => i.id === detailedItemId) || null}
                onClose={() => setDetailedItemId(null)}
            />

            <OnboardingModal isFirstTime={items.length === 0} />
        </>
    );
}
