import React, { useEffect, useState } from 'react';
import { User, Package, MapPin, LogOut, ShoppingBag, ArrowRight } from 'lucide-react';

interface AccountPageViewProps {
  onNavigate?: (path: string) => void;
  brandName?: string;
  storeSlug?: string;
}

export const AccountPageView: React.FC<AccountPageViewProps> = ({
  onNavigate,
  brandName = 'Store',
  storeSlug = ''
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeAuthTab, setActiveAuthTab] = useState<'login' | 'register'>('login');
  const [activeAccountTab, setActiveAccountTab] = useState<'orders' | 'addresses' | 'profile' | 'support'>('orders');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [customerName, setCustomerName] = useState('Valued Customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportNotice, setSupportNotice] = useState('');
  const [selectedCustomerTicket, setSelectedCustomerTicket] = useState<any>(null);
  const [customerTicketMessages, setCustomerTicketMessages] = useState<any[]>([]);
  const [ticketReply, setTicketReply] = useState('');
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');
  const accountTokenKey = `billionbiz_customer:${storeSlug}`;

  const customerRequest = async (path: string, body?: unknown, token?: string) => {
    const response = await fetch(`${apiBase}${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Customer account request failed.');
    return result;
  };
  const loadTickets = async () => { const token = localStorage.getItem(accountTokenKey); if (!token) return; const result = await customerRequest('/storefront/customer/tickets', undefined, token); setTickets(result.tickets || []); };
  const createSupportTicket = async (event: React.FormEvent) => { event.preventDefault(); const token = localStorage.getItem(accountTokenKey); if (!token) return; try { await customerRequest('/storefront/customer/tickets', { subject: supportSubject, message: supportMessage }, token); setSupportSubject(''); setSupportMessage(''); setSupportNotice('Your support request was sent.'); await loadTickets(); } catch (error) { setSupportNotice(error instanceof Error ? error.message : 'Could not send your request.'); } };
  const openCustomerTicket = async (ticket: any) => { const token = localStorage.getItem(accountTokenKey); if (!token) return; setSelectedCustomerTicket(ticket); try { const result = await customerRequest(`/storefront/customer/tickets/${ticket.id}/messages`, undefined, token); setCustomerTicketMessages(result.messages || []); } catch (error) { setSupportNotice(error instanceof Error ? error.message : 'Could not load this conversation.'); } };
  const replyToCustomerTicket = async (event: React.FormEvent) => { event.preventDefault(); if (!selectedCustomerTicket || !ticketReply.trim()) return; const token = localStorage.getItem(accountTokenKey); if (!token) return; try { await customerRequest(`/storefront/customer/tickets/${selectedCustomerTicket.id}/messages`, { body: ticketReply.trim() }, token); setTicketReply(''); await openCustomerTicket(selectedCustomerTicket); await loadTickets(); } catch (error) { setSupportNotice(error instanceof Error ? error.message : 'Could not send your reply.'); } };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true); setAuthError('');
    try { const result = await customerRequest(`/storefront/by-slug/${encodeURIComponent(storeSlug)}/customers/login`, { email: loginEmail, password: loginPassword }); localStorage.setItem(accountTokenKey, result.token); setCustomerName(`${result.customer.firstName || ''} ${result.customer.lastName || ''}`.trim() || result.customer.email); setIsAuthenticated(true); const data = await customerRequest('/storefront/customer/orders', undefined, result.token); setOrders(data.orders || []); }
    catch (error) { setAuthError(error instanceof Error ? error.message : 'Could not sign in.'); }
    finally { setAuthBusy(false); }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true); setAuthError('');
    try { const result = await customerRequest(`/storefront/by-slug/${encodeURIComponent(storeSlug)}/customers/register`, { email: loginEmail, password: loginPassword, firstName, lastName }); localStorage.setItem(accountTokenKey, result.token); setCustomerName(`${firstName} ${lastName}`.trim() || result.customer.email); setIsAuthenticated(true); setOrders([]); }
    catch (error) { setAuthError(error instanceof Error ? error.message : 'Could not create your account.'); }
    finally { setAuthBusy(false); }
  };

  useEffect(() => {
    const token = localStorage.getItem(accountTokenKey);
    if (!token) return;
    void Promise.all([customerRequest('/storefront/customer/profile', undefined, token), customerRequest('/storefront/customer/orders', undefined, token)])
      .then(([profile, orderData]) => {
        const customer = profile.customer;
        setLoginEmail(customer.email || '');
        setCustomerName(`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email);
        setOrders(orderData.orders || []);
        setIsAuthenticated(true);
      })
      .catch(() => localStorage.removeItem(accountTokenKey));
  }, [storeSlug]);

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
                {authBusy ? 'Signing in…' : 'Sign In'}
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
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Morgan"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
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
                {authBusy ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}
          {authError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{authError}</p>}
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
              onClick={() => { localStorage.removeItem(accountTokenKey); setIsAuthenticated(false); setOrders([]); }}
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
            <button onClick={() => { setActiveAccountTab('support'); void loadTickets(); }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${activeAccountTab === 'support' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Support</button>
          </div>

          {/* Tab Content */}
          {activeAccountTab === 'orders' && (
            <div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ShoppingBag size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{orders.length ? 'Your orders' : 'No orders placed yet'}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {orders.length ? 'Your order status and recent purchases.' : 'Your orders will appear here after you purchase from this store.'}
                </p>
              </div>
              {orders.length ? <div className="space-y-3 text-left">{orders.map((order) => <article key={order.id} className="flex justify-between gap-4 border border-[var(--theme-border)] rounded-xl p-4"><div><strong>{order.order_number}</strong><p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()} · {order.fulfillment_status}</p></div><strong>{order.currency} {(Number(order.total_minor) / 100).toFixed(2)}</strong></article>)}</div> : <div>
                <button
                  onClick={() => onNavigate?.('/shop')}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                >
                  Start Shopping
                  <ArrowRight size={13} />
                </button>
              </div>}
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

          {activeAccountTab === 'support' && <div className="grid gap-6 lg:grid-cols-2"><form onSubmit={createSupportTicket} className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-6 space-y-3"><h3 className="font-bold">Contact store support</h3><input required value={supportSubject} onChange={(event) => setSupportSubject(event.target.value)} placeholder="Subject" className="w-full rounded-lg border p-3 text-sm" /><textarea required rows={4} value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="How can we help?" className="w-full rounded-lg border p-3 text-sm" /><button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Send request</button>{supportNotice && <p role="status" className="text-xs text-slate-600">{supportNotice}</p>}</form><div className="bg-white dark:bg-slate-900 border border-[var(--theme-border)] rounded-2xl p-6"><h3 className="font-bold mb-3">Your support tickets</h3>{tickets.length ? tickets.map((ticket) => <button key={ticket.id} type="button" onClick={() => void openCustomerTicket(ticket)} className="w-full border-t py-3 text-left"><strong>{ticket.subject}</strong><p className="text-xs text-slate-500">{ticket.ticket_number} · {ticket.status}</p></button>) : <p className="text-sm text-slate-500">No support requests yet.</p>}{selectedCustomerTicket && <section className="mt-4 border-t pt-4"><h4 className="font-semibold">{selectedCustomerTicket.subject}</h4><div className="my-3 max-h-48 space-y-2 overflow-auto">{customerTicketMessages.map((message) => <div key={message.id} className={`rounded-lg p-3 text-sm ${message.author_type === 'CUSTOMER' ? 'bg-indigo-50' : 'bg-slate-100'}`}>{message.body}<time className="block text-[10px] text-slate-500">{new Date(message.created_at).toLocaleString()}</time></div>)}</div><form onSubmit={replyToCustomerTicket} className="flex gap-2"><input value={ticketReply} onChange={(event) => setTicketReply(event.target.value)} placeholder="Reply…" className="min-w-0 flex-1 rounded-lg border p-2 text-sm" /><button disabled={!ticketReply.trim()} className="rounded-lg bg-slate-900 px-3 text-xs text-white">Send</button></form></section>}</div></div>}
        </div>
      )}
    </div>
  );
};

