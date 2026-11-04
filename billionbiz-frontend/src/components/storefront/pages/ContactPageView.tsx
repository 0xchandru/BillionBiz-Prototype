import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

interface ContactPageViewProps {
  brandName?: string;
  storeInfo?: {
    email?: string;
    phone?: string;
    address?: string;
    businessHours?: string;
  };
}

export const ContactPageView: React.FC<ContactPageViewProps> = ({
  brandName = 'Our Business',
  storeInfo
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const fallbackEmail = `support@${(import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').trim()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Get in Touch</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Have a question about our catalogue, services, or an existing order? Send us a message and our team will get back to you promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Details</h2>

            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Email Address</p>
                  <a href={`mailto:${storeInfo?.email || fallbackEmail}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                    {storeInfo?.email || fallbackEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Phone Support</p>
                  <p>{storeInfo?.phone || '+1 (800) 555-0199'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Store Address</p>
                  <p>{storeInfo?.address || '100 Commerce Way, Suite 400, Financial District'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Business Hours</p>
                  <p>{storeInfo?.businessHours || 'Monday – Friday: 9:00 AM – 6:00 PM EST'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Inquiry Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-3xl p-6 sm:p-8">
          {isSent ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Dispatched!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Thank you for reaching out to {brandName}. Our customer support team will reply to <strong>{email}</strong> within one business day.
                </p>
              </div>
              <button
                onClick={() => { setIsSent(false); setMessage(''); setSubject(''); }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition cursor-pointer"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Morgan Vance"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="morgan@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Inquiry regarding order or products"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
              >
                <Send size={13} />
                Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

