import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { CustomerReview } from '../types/index.ts';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | null;
  sessionId?: string;
  onSubmitReview: (review: Partial<CustomerReview>) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  sessionId,
  onSubmitReview,
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitReview({
        tableNumber: tableNumber || undefined,
        sessionId,
        customerName: customerName.trim() || 'Verified Dining Guest',
        overallRating,
        foodRating,
        serviceRating,
        cleanlinessRating,
        valueRating,
        comment: comment.trim(),
        photoUrl: '/src/assets/images/food_signature_wagyu_1793555392859.jpg',
      });
      setIsDone(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Review submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-neutral-300 dark:text-neutral-700'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-mono font-semibold ml-2 text-neutral-600 dark:text-neutral-400">
          {rating}.0
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400">
              Verified Dining Session · Table {tableNumber || 'Guest'}
            </div>
            <h2 className="text-xl font-serif font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
              Rate Your Gastronomic Experience
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {isDone ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-neutral-900 dark:text-neutral-100">
                Thank You for Your Feedback
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your verified review has been recorded and will be shared with the kitchen brigade and service leadership.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Star Criteria */}
              <div className="space-y-3.5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Overall Experience</span>
                  {renderStars(overallRating, setOverallRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">Food & Taste Quality</span>
                  {renderStars(foodRating, setFoodRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">Service & Hospitality</span>
                  {renderStars(serviceRating, setServiceRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">Atmosphere & Cleanliness</span>
                  {renderStars(cleanlinessRating, setCleanlinessRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-700 dark:text-neutral-300">Value for Money</span>
                  {renderStars(valueRating, setValueRating)}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                  Comments & Tasting Notes
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us what you enjoyed, which dishes stood out, or how we can elevate your next visit..."
                  rows={3}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Posting Verified Review...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
