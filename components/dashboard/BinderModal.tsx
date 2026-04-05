'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Palette } from 'lucide-react';

const BINDER_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

interface BinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description?: string; color?: string }) => Promise<void>;
    initialData?: { name: string; description?: string; color?: string };
    mode?: 'create' | 'edit';
}

export function BinderModal({ isOpen, onClose, onSubmit, initialData, mode = 'create' }: BinderModalProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [color, setColor] = useState(initialData?.color || BINDER_COLORS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Binder name is required');
            return;
        }
        if (name.trim().length > 50) {
            setError('Name must be under 50 characters');
            return;
        }

        setError('');
        setIsSubmitting(true);
        try {
            await onSubmit({ name: name.trim(), description: description.trim() || undefined, color });
            setName('');
            setDescription('');
            setColor(BINDER_COLORS[0]);
            onClose();
        } catch {
            setError('Failed to save binder');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    role="dialog"
                    aria-modal="true"
                    className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10">
                                <FolderPlus size={20} className="text-primary" />
                            </div>
                            <h2 className="text-xl font-bold">{mode === 'create' ? 'New Binder' : 'Edit Binder'}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors" aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="binder-name" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                                Binder Name
                            </label>
                            <input
                                id="binder-name"
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(''); }}
                                placeholder="e.g. My Graded Cards"
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                autoFocus
                                maxLength={50}
                            />
                            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="binder-desc" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                                Description <span className="text-muted-foreground/50">(optional)</span>
                            </label>
                            <textarea
                                id="binder-desc"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Notes about this binder..."
                                rows={2}
                                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium resize-none"
                                maxLength={200}
                            />
                        </div>

                        {/* Color Picker */}
                        <div>
                            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Palette size={14} /> Color
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {BINDER_COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-card scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: c }}
                                        aria-label={`Select color ${c}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-secondary/20 rounded-xl p-4 flex items-center gap-3 border border-border/50">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm font-bold">{name || 'Untitled Binder'}</span>
                            {description && <span className="text-xs text-muted-foreground truncate ml-auto">{description}</span>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-medium hover:bg-secondary/50 transition-colors border border-border"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !name.trim()}
                            className="flex-1 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : mode === 'create' ? 'Create Binder' : 'Save Changes'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
