import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Lock, CreditCard, Banknote, ArrowLeft } from 'lucide-react';
import { useStorefrontCartStore } from '../../../store/storefrontCartStore';

interface CheckoutPageViewProps {
  onNavigate?: (path: string) => void;
  brandName?: string;
}

export const CheckoutPageView: React.FC<CheckoutPageViewProps> = ({ onNavigate, brandName = 'Store' }) => {
  const { items, getSubtotal, clearCart } = useStorefrontCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOrderNum = `BBZ-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(generatedOrderNum);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Order Confirmed!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thank you, {fullName}. We have received your order <strong>#{orderNumber}</strong> at {brandName}.
          </p>
          <p className="text-xs text-slate-400">
            A confirmation receipt and live tracking updates will be dispatched to {email}.
          </p>
        </div>

        <button
          onClick={() => onNavigate?.('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold text-sm shadow-md hover:opacity-90 transition cursor-pointer"
        >
          <span>Return to Homepage</span>
          <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
        <div className="space-y-1">
          <button
            onClick={() => onNavigate?.('/cart')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition mb-1 cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Cart</span>
          </button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Lock size={20} className="text-emerald-500" />
            Secure Express Checkout
          </h1>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Checkout Inputs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Details */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="First and last name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Delivery Address</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Apartment, suite, unit, building, floor"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="560038"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'online'
                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="hidden"
                />
                <CreditCard size={20} className="text-indigo-600" />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">UPI / Cards / Netbanking</span>
                  <span className="text-xs text-slate-400 block">Instant automated payment verification</span>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="hidden"
                />
                <Banknote size={20} className="text-emerald-600" />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">Cash on Delivery</span>
                  <span className="text-xs text-slate-400 block">Pay cash at time of doorstep delivery</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-[var(--theme-border)] h-fit space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Items ({items.length})</h2>

          <div className="max-h-60 overflow-y-auto divide-y divide-[var(--theme-border)] pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="font-bold text-slate-400">{item.quantity}×</span>
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-slate-500 border-t border-[var(--theme-border)] pt-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t border-[var(--theme-border)] pt-3">
            <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[var(--theme-btn-primary-bg)] text-[var(--theme-btn-primary-text)] font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Complete Order</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};

