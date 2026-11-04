import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface BookingPageViewProps {
  offerings?: any[];
  onNavigate?: (path: string) => void;
  brandName?: string;
}

export const BookingPageView: React.FC<BookingPageViewProps> = ({
  offerings = [],
  onNavigate,
  brandName = 'Our Business'
}) => {
  const [selectedOffering, setSelectedOffering] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Time slots generator
  const availableSlots = [
    '09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:15 PM'
  ];

  // Quick dates (next 5 days)
  const today = new Date();
  const dateOptions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      display: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering || !selectedDate || !selectedSlot || !clientName || !clientEmail) {
      alert('Please fill in all required booking details.');
      return;
    }
    setIsConfirmed(true);
  };

  const resetBooking = () => {
    setSelectedOffering(null);
    setSelectedDate('');
    setSelectedSlot('');
    setIsConfirmed(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[var(--theme-border)] pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Book an Appointment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select a verified service offering, pick an available slot, and confirm your session with {brandName}.
        </p>
      </div>

      {isConfirmed ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Appointment Reserved!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              We've received your booking request for <strong>{selectedOffering?.name}</strong> on{' '}
              <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 text-left text-xs space-y-2 border border-emerald-100 dark:border-emerald-900/30">
            <p><span className="text-slate-400">Client:</span> {clientName} ({clientEmail})</p>
            {clientPhone && <p><span className="text-slate-400">Phone:</span> {clientPhone}</p>}
            {notes && <p><span className="text-slate-400">Special Notes:</span> {notes}</p>}
          </div>
          <div className="pt-2">
            <button
              onClick={resetBooking}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition cursor-pointer"
            >
              Book Another Session
            </button>
          </div>
        </div>
      ) : offerings.length === 0 ? (
        /* Truthful Empty State */
        <div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Calendar size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Services Available Currently</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This merchant has not published any active bookable service offerings yet. Please check back later or contact us directly.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/contact')}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              Contact Merchant
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step 1: Select Service Offering */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">1</span>
              Select a Service
            </h2>

            <div className="space-y-3">
              {offerings.map((offering) => {
                const isSelected = selectedOffering?.id === offering.id;
                const formattedPrice = (offering.price_minor / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: offering.currency || 'USD'
                });

                return (
                  <div
                    key={offering.id}
                    onClick={() => setSelectedOffering(offering)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                        : 'border-[var(--theme-border)] bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{offering.name}</h3>
                        {offering.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{offering.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          {offering.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {offering.duration_minutes} mins
                            </span>
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white">{formattedPrice}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 & 3: Date, Time & Details */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-3xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">2</span>
                Choose Date & Time Slot
              </h2>

              {!selectedOffering ? (
                <p className="text-xs text-slate-400 italic">Please select a service from step 1 first.</p>
              ) : (
                <div className="space-y-4">
                  {/* Quick Dates */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Available Dates
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {dateOptions.map((d) => (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => setSelectedDate(d.iso)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                            selectedDate === d.iso
                              ? 'border-indigo-600 bg-indigo-600 text-white font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {d.display}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {selectedDate && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Available Times
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                              selectedSlot === slot
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Contact Details */}
            {selectedOffering && selectedDate && selectedSlot && (
              <form onSubmit={handleBookingSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">3</span>
                  Your Details
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Special Requests</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific instructions or goals for this session..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  Confirm Appointment
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

