import React, { useState } from 'react';
import { X, Bell, Droplets, Wine, Utensils, Receipt, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../utils/api.ts';
import { sounds } from '../utils/sound.ts';
import { WaiterProfile } from '../types/index.ts';

interface ServiceBellModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | null;
  assignedWaiter?: WaiterProfile;
}

const SERVICE_TYPES = [
  { id: 'Water Refill', label: 'Carafe Water Refill', desc: 'Still or sparkling water replenish', icon: Droplets },
  { id: 'Sommelier Assistance', label: 'Sommelier Wine Consultation', desc: 'Advice on pairings, vintages, or cocktails', icon: Wine },
  { id: 'Silverware & Napkins', label: 'Fresh Silverware & Napkins', desc: 'Additional cutlery, linen, or side plates', icon: Utensils },
  { id: 'Bill Request', label: 'Request Printed Bill', desc: 'Ready for table check settlement', icon: Receipt },
  { id: 'General Assistance', label: 'General Table Assistance', desc: 'Ask a question or request a course change', icon: MessageSquare },
];

export const ServiceBellModal: React.FC<ServiceBellModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  assignedWaiter,
}) => {
  if (!isOpen) return null;

  const [selectedType, setSelectedType] = useState('Water Refill');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) {
      setErrorMsg('Please select a table first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await api.createServiceRequest({
        tableNumber,
        requestType: selectedType,
        note: customNote.trim() || undefined,
      });

      sounds.playServiceBell();
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to summon service. Please wave to a floor runner.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold leading-tight">
                Tableside Service Call
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Table {tableNumber || '02'} · Assigned to {assignedWaiter?.name || 'Floor Lead'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {isDone ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-neutral-900 dark:text-neutral-100">
                Staff Notified
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                Your request has been beamed to {assignedWaiter?.name || 'your floor team'}. A runner will attend to Table {tableNumber} immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                  Select Assistance Type
                </label>

                <div className="space-y-2">
                  {SERVICE_TYPES.map(st => {
                    const isSelected = selectedType === st.id;
                    const Icon = st.icon;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedType(st.id)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30'
                            : 'bg-white dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {st.label}
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                            {st.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-1">
                  Specific Note for Waiter (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  placeholder="e.g. 2 more glasses of chilled sparkling water..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm font-bold flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>{loading ? 'Ringing Staff Station...' : `Summon Waiter to Table ${tableNumber}`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
