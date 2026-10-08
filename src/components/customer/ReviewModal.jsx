import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Star } from 'lucide-react';
import { addReview } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ReviewModal = ({ isOpen, onClose, booking, onSuccess }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      error('Comment required', 'Please share a few words about your rental experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        vehicle_id: booking.vehicle_id,
        booking_id: booking.id,
        customer_id: user?.id || booking.customer_id,
        customer_name: user?.full_name || booking.customer_name || 'Customer',
        rating,
        comment: comment.trim()
      });

      success('Review Submitted', 'Thank you for your valuable feedback!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      error('Failed to submit review', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Your Experience"
      subtitle={`How was your rental journey with ${booking.vehicle_name}?`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {/* Star Rating Selector */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 mb-2 font-medium">Tap to select stars</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-amber-400 mt-2">
            {rating === 5 && 'Outstanding! Loved every minute.'}
            {rating === 4 && 'Very Good, smooth drive.'}
            {rating === 3 && 'Average experience.'}
            {rating === 2 && 'Needs improvement.'}
            {rating === 1 && 'Unsatisfactory.'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Your Review & Comments
          </label>
          <textarea
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about the vehicle condition, pickup handover, cleanliness, and road handling..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#023e8a] leading-relaxed"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Publish Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
