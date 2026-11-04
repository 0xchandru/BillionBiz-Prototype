import React, { useState } from 'react';
import { User, Package, MapPin, LogOut, ShoppingBag, ArrowRight } from 'lucide-react';

interface AccountPageViewProps {
  onNavigate?: (path: string) => void;
  brandName?: string;
}

export const AccountPageView: React.FC<AccountPageViewProps> = ({
  onNavigate,
  brandName = 'Store'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeAuthTab, setActiveAuthTab] = useState<'login' | 'register'>('login');
  const [activeAccountTab, setActiveAccountTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [customerName, setCustomerName] = useState('Valued Customer');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setCustomerName(loginEmail.split('@')[0] || 'Valued Customer');
    setIsAuthenticated(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    setCustomerName(loginEmail.split('@')[0] || 'Valued Customer');
    setIsAuthenticated(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Auth Tab Selector */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => setActiveAuthTab('login')}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                activeAuthTab === 'login'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveAuthTab('register')}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition ${
                activeAuthTab === 'register'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {activeAuthTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
                <p className="text-xs text-slate-500 mt-1">Sign in to check order status and manage your details</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link will be sent to your email.'); }} className="text-xs text-indigo-600 hover:underline">
                    Forgot?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create an Account</h2>
                <p className="text-xs text-slate-500 mt-1">Join {brandName} for faster checkout and order tracking</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Alex"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Morgan"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
              >
                Register
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Authenticated Customer Portal */
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome, {customerName}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage your orders and saved shipping addresses</p>
              </div>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveAccountTab('orders')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeAccountTab === 'orders'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Package size={14} />
              Order History
            </button>
            <button
              onClick={() => setActiveAccountTab('addresses')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeAccountTab === 'addresses'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <MapPin size={14} />
              Addresses
            </button>
            <button
              onClick={() => setActiveAccountTab('profile')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeAccountTab === 'profile'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <User size={14} />
              Profile Details
            </button>
          </div>

          {/* Tab Content */}
          {activeAccountTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ShoppingBag size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">No orders placed yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you make a purchase from our store, your real invoice receipts and order fulfillment status will be tracked here.
                </p>
              </div>
              <div>
                <button
                  onClick={() => onNavigate?.('/shop')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                >
                  Start Shopping
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {activeAccountTab === 'addresses' && (
            <div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Saved Addresses</h3>
                <button
                  onClick={() => alert('Address editor will be enabled upon first checkout.')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  + Add Address
                </button>
              </div>
              <p className="text-xs text-slate-500">
                No delivery addresses saved yet. You can save addresses during your next checkout for one-click ordering.
              </p>
            </div>
          )}

          {activeAccountTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-8 max-w-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Information</h3>
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p><span className="font-semibold text-slate-900 dark:text-white">Name:</span> {customerName}</p>
                <p><span className="font-semibold text-slate-900 dark:text-white">Email:</span> {loginEmail || 'customer@example.com'}</p>
                <p><span className="font-semibold text-slate-900 dark:text-white">Account Status:</span> Active</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

