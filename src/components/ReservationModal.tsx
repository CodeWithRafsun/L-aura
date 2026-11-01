import React, { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, CheckCircle2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../utils/api.ts';
import { sounds } from '../utils/sound.ts';
import { RestaurantSettings } from '../types/index.ts';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RestaurantSettings;
}

const SECTIONS = [
  { id: 'Main Dining Room', label: 'Main Dining Room', desc: 'Hearth-side ambience with open wood-fire views' },
  { id: 'Window Alcove', label: 'Window Alcove', desc: 'Intimate terrace sunset & skyline views' },
  { id: 'Wine Cellar Salon', label: 'Wine Cellar Salon', desc: 'Candlelight vault surrounded by biodynamic vintages' },
  { id: 'Garden Terrace', label: 'Garden Terrace', desc: 'Al fresco dining beneath olive trees & canopy lights' },
];

const TIME_SLOTS = [
  '5:00 PM', '5:30 PM', '6:15 PM', '7:00 PM', '7:45 PM', '8:30 PM', '9:15 PM'
];

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('7:00 PM');
  const [section, setSection] = useState('Main Dining Room');
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.createReservation({
        guestName,
        guestEmail,
        guestPhone,
        partySize,
        date,
        timeSlot,
        section,
        specialRequests: specialRequests.trim() || undefined,
      });

      sounds.playSuccess();
      setConfirmedReservation(res.reservation);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to confirm table booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-semibold leading-tight">
                Table Reservation & Tasting Journey
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {settings.name} · San Francisco Upper Terrace
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
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {confirmedReservation ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                  Reservation Confirmed
                </span>
                <h3 className="text-2xl font-serif font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  We Look Forward to Welcoming You
                </h3>
              </div>

              {/* Booking Confirmation Ticket */}
              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/80 max-w-md mx-auto text-left space-y-3 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500">Booking Reference:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {confirmedReservation.bookingCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Guest Name</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{confirmedReservation.guestName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Party Size</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{confirmedReservation.partySize} Guests</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Date & Time</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{confirmedReservation.date} at {confirmedReservation.timeSlot}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Atmosphere</span>
                    <strong className="text-neutral-900 dark:text-neutral-100">{confirmedReservation.section}</strong>
                  </div>
                </div>

                {confirmedReservation.specialRequests && (
                  <p className="text-[11px] italic text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    "{confirmedReservation.specialRequests}"
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-300 transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Party Size Stepper */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>Number of Guests</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 8].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPartySize(size)}
                      className={`w-10 h-10 rounded-xl font-mono text-xs font-semibold transition-colors ${
                        partySize === size
                          ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Service Seating Time
                  </label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Atmosphere / Seating Area */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-2">
                  Preferred Seating Atmosphere
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SECTIONS.map(sec => {
                    const isSelected = section === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSection(sec.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30'
                            : 'bg-white dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300'
                        }`}
                      >
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {sec.label}
                        </p>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                          {sec.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="e.g. Charlotte Hayes"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    placeholder="charlotte@example.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    placeholder="+1 (415) 000-0000"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
                  Special Dietary or Occasion Notes
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Wedding anniversary, celebrate milestone, severe shellfish allergy..."
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
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Confirming with Maître d\'...' : 'Confirm Table Booking'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
