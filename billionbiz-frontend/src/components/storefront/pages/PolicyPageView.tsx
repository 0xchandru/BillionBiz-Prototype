import React from 'react';
import { ShieldCheck, FileText, RotateCcw } from 'lucide-react';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';

interface PolicyPageViewProps {
  type: 'privacy' | 'terms' | 'refund';
  brandName?: string;
  customContent?: string;
}

export const PolicyPageView: React.FC<PolicyPageViewProps> = ({
  type,
  brandName = 'Our Store',
  customContent
}) => {
  const meta = {
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      updated: 'November 2026',
      description: `Learn how ${brandName} collects, protects, and handles your personal information.`
    },
    terms: {
      title: 'Terms of Service',
      icon: FileText,
      updated: 'November 2026',
      description: `These terms govern your access to and use of ${brandName}'s website and purchases.`
    },
    refund: {
      title: 'Refund & Returns Policy',
      icon: RotateCcw,
      updated: 'November 2026',
      description: `Understand our standards for returns, refunds, exchanges, and cancellations.`
    }
  }[type];

  const Icon = meta.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--theme-border)] pb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
          <Icon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{meta.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Last Updated: {meta.updated} • {meta.description}
          </p>
        </div>
      </div>

      {/* Body Content */}
      {customContent ? (
        <div
          className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(customContent) }}
        />
      ) : (
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {type === 'privacy' && (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
                <p>
                  When you visit or make a purchase from {brandName}, we collect certain information necessary to fulfill your order, including your name, billing address, shipping address, payment information, email address, and phone number.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
                <p>
                  We use your personal data to process orders, manage bookings, communicate updates regarding your transactions, prevent fraud, and comply with applicable statutory obligations.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Data Sharing & Security</h2>
                <p>
                  We do not sell your personal data. We share only necessary details with trusted processors (such as shipping couriers and payment gateways) strictly to provide our services securely. All transmissions use industry-standard encryption protocols.
                </p>
              </section>
            </>
          )}

          {type === 'terms' && (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
                <p>
                  By accessing or purchasing from {brandName}, you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, you may not access our services.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Accuracy of Billing & Pricing</h2>
                <p>
                  Prices for our products and services are subject to change without notice. We reserve the right at any time to modify or discontinue any product or service without liability. We reserve the right to refuse any order you place with us.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Governing Law</h2>
                <p>
                  These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws governing {brandName}'s registered jurisdiction.
                </p>
              </section>
            </>
          )}

          {type === 'refund' && (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Returns & Eligibility</h2>
                <p>
                  We accept returns on physical goods within 14 days of delivery, provided the item is unused, unworn, and in its original sealed packaging with all tags attached. Perishable goods and custom services are non-returnable.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Refund Processing</h2>
                <p>
                  Once your returned item is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be automatically applied to your original method of payment within 5 to 7 business days.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Service Cancellations & Rescheduling</h2>
                <p>
                  For scheduled appointments and bookings, cancellations requested at least 24 hours prior to the scheduled slot are eligible for a full refund or free rescheduling.
                </p>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};

