import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { api } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { getPortalUrl } from '../utils/subdomain';

const formatCurrency = (minor: number) => {
  return '₹' + (minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
};

const POSPage: React.FC = () => {
  const { isAuthenticated, loginUnified } = useAuthStore();
  const [counters, setCounters] = useState<any[]>([]);
  const [selectedCounter, setSelectedCounter] = useState<string>('');
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [openingFloat, setOpeningFloat] = useState('2000');
  const [closingCash, setClosingCash] = useState('');
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [zReport, setZReport] = useState<any | null>(null);

  // POS Cashier Login State (when unauthenticated on pos.chandraprakash.codes)
  const [posIdentifier, setPosIdentifier] = useState('');
  const [posPin, setPosPin] = useState('');
  const [posLoading, setPosLoading] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);

  // Cart & Catalog
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ variantId: string; title: string; priceMinor: number; quantity: number }[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);

  // Checkout
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [receipt, setReceipt] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePOSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posIdentifier.trim() || !posPin) return;
    setPosLoading(true);
    setPosError(null);
    try {
      const res = await loginUnified(posIdentifier.trim(), { password: posPin });
      if (!res.success) {
        setPosError(res.error || 'Invalid cashier credentials or PIN.');
      } else {
        await loadCounterAndRegister();
        await loadProductsAndAppointments();
      }
    } catch (err: any) {
      setPosError(err.message || 'POS cashier authentication failed.');
    } finally {
      setPosLoading(false);
    }
  };

  const loadCounterAndRegister = async () => {
    try {
      const cRes = await api.getCounters();
      const availableCounters = cRes.counters || [];
      setCounters(availableCounters);
      const activeCounterId = availableCounters.some((counter: any) => counter.id === selectedCounter)
        ? selectedCounter
        : availableCounters[0]?.id || '';
      setSelectedCounter(activeCounterId);
      if (!activeCounterId) {
        setActiveSession(null);
        return;
      }
      const regRes = await api.getCurrentRegister(activeCounterId);
      setActiveSession(regRes.session);
    } catch (err) {
      console.error('Failed to load register state', err);
    }
  };

  const loadProductsAndAppointments = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        api.getProducts({ search: search || undefined }),
        api.getBookings({ status: 'CONFIRMED' })
      ]);
      setProducts(pRes.products || []);
      setPendingAppointments(bRes.bookings?.filter((b: any) => b.balance_due_minor > 0) || []);
    } catch (err) {
      console.error('Failed to load products/appointments', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadCounterAndRegister();
    void loadProductsAndAppointments();
  }, [isAuthenticated]);

  const handleOpenRegister = async () => {
    if (!selectedCounter) {
      alert('Create a POS counter before opening a register.');
      return;
    }
    try {
      const floatMinor = Math.round(parseFloat(openingFloat || '0') * 100);
      await api.openRegister(selectedCounter, floatMinor);
      setIsOpeningModal(false);
      await loadCounterAndRegister();
    } catch (err: any) {
      alert(err.message || 'Failed to open register');
    }
  };

  const handleCloseRegister = async () => {
    if (!activeSession) return;
    try {
      const cashMinor = Math.round(parseFloat(closingCash || '0') * 100);
      const res = await api.closeRegister(activeSession.id, cashMinor);
      setZReport(res.zReport);
      setIsClosingModal(false);
      setActiveSession(null);
    } catch (err: any) {
      alert(err.message || 'Failed to close register');
    }
  };

  const addToCart = (product: any, variant: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.variantId === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          variantId: variant.id,
          title: `${product.name} (${variant.sku})`,
          priceMinor: variant.price_minor,
          quantity: 1
        }
      ];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any[]
    );
  };

  const subtotalMinor = cart.reduce((acc, item) => acc + item.priceMinor * item.quantity, 0);
  const appointmentTotalMinor = selectedAppointment ? selectedAppointment.balance_due_minor : 0;
  const grandTotalMinor = subtotalMinor + appointmentTotalMinor;

  const handleCheckout = async () => {
    if (!selectedCounter || !activeSession) {
      alert('Open a register session for a configured POS counter before checkout.');
      return;
    }
    if (grandTotalMinor <= 0) {
      alert('Cart is empty. Add products or select an appointment to checkout.');
      return;
    }

    try {
      setSubmitting(true);
      const tenderedMinor = paymentMethod === 'CASH' && cashTendered
        ? Math.round(parseFloat(cashTendered) * 100)
        : grandTotalMinor;

      const res = await api.posCheckout({
        counterId: selectedCounter,
        sessionId: activeSession.id,
        items: cart.map((c) => ({ variantId: c.variantId, quantity: c.quantity })),
        appointmentBookingId: selectedAppointment?.id,
        paymentMethod,
        cashTenderedMinor: tenderedMinor
      });

      setReceipt(res.receipt);
      setCart([]);
      setSelectedAppointment(null);
      setCashTendered('');
      await loadCounterAndRegister();
    } catch (err: any) {
      alert(err.message || 'POS Checkout Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const adminLoginUrl = getPortalUrl('admin', '/login');
  const adminHost = `admin.${rootDomain}`;
  const posHost = `pos.${rootDomain}`;

  // Dedicated POS Cashier Login view when unauthenticated
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '36px 32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', color: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <ShoppingCart size={24} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px' }}>POS Counter Terminal</h1>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
              {posHost}
            </p>
          </div>

          {posError && (
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '18px' }}>
              {posError}
            </div>
          )}

          <form onSubmit={handlePOSLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Cashier Identifier</label>
              <input
                type="text"
                value={posIdentifier}
                onChange={(e) => setPosIdentifier(e.target.value)}
                placeholder="Cashier email or phone"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>Register PIN or Password</label>
              <input
                type="password"
                value={posPin}
                onChange={(e) => setPosPin(e.target.value)}
                placeholder="Enter 4-digit PIN or password"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={posLoading}
              style={{ width: '100%', padding: '11px', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              {posLoading ? 'Connecting...' : 'Open POS Register'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
            Merchant Administration:{' '}
            <a href={adminLoginUrl} style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
              {adminHost}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', background: '#f4f5f7' }}>
      {/* POS Top Bar */}
      <div style={{
        background: '#fff',
        padding: '12px 24px',
        borderBottom: '1px solid #dcdfe4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1f36' }}>Counter POS Terminal</h2>
          {counters.length > 0 && (
            <select
              value={selectedCounter}
              onChange={(e) => {
                const newCounterId = e.target.value;
                setSelectedCounter(newCounterId);
                api.getCurrentRegister(newCounterId)
                  .then((reg) => setActiveSession(reg.session))
                  .catch(() => setActiveSession(null));
              }}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #dcdfe4', fontSize: '12px' }}
            >
              {counters.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {counters.length === 0 && (
            <a href="/pos/counters" style={{ fontSize: 12, color: '#b45309', fontWeight: 650, textDecoration: 'none' }}>
              No POS counters configured · Set up a counter
            </a>
          )}
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            background: activeSession ? '#e6f7ec' : '#fff8e6',
            color: activeSession ? '#0d8a3e' : '#b25e00'
          }}>
            {activeSession ? '● Register OPEN' : '○ Register CLOSED'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!activeSession ? (
            <button
              onClick={() => setIsOpeningModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#0d8a3e',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Open Register (Float)
            </button>
          ) : (
            <button
              onClick={() => setIsClosingModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #dcdfe4',
                background: '#fff',
                color: '#d9381e',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close Register (Z-Report)
            </button>
          )}
        </div>
      </div>

      {/* Main POS Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Column: Product & Appointment Grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#8792a2' }} />
              <input
                type="text"
                placeholder="Scan barcode or search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProductsAndAppointments()}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '6px',
                  border: '1px solid #dcdfe4',
                  fontSize: '14px',
                  background: '#fff'
                }}
              />
            </div>
          </div>

          {/* Pending Appointments Section */}
          {pendingAppointments.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#4f566b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> Collect Balance for Today's Appointments
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {pendingAppointments.map((b) => {
                  const isSelected = selectedAppointment?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedAppointment(isSelected ? null : b)}
                      style={{
                        background: isSelected ? '#edf2ff' : '#fff',
                        border: isSelected ? '2px solid #0066cc' : '1px solid #dcdfe4',
                        borderRadius: '6px',
                        padding: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{b.booking_number}</span>
                        <span style={{ color: '#d9381e', fontWeight: '700', fontSize: '13px' }}>
                          {formatCurrency(b.balance_due_minor)}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#4f566b' }}>{b.offering_name}</div>
                      <div style={{ fontSize: '11px', color: '#8792a2', marginTop: '2px' }}>
                        Client: {b.first_name || 'Walk-in'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#4f566b', marginBottom: '8px' }}>
            Products Catalog
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {products.map((p) => {
              const v = p.variants?.[0] || {};
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p, v)}
                  style={{
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #dcdfe4',
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a1f36', marginBottom: '4px' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8792a2', marginBottom: '10px' }}>
                      SKU: {v.sku}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#0d8a3e', fontSize: '15px' }}>
                      {formatCurrency(v.price_minor || 0)}
                    </span>
                    <button style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: '#0066cc',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}>
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: POS Cart & Tender */}
        <div style={{
          width: '420px',
          background: '#fff',
          borderLeft: '1px solid #dcdfe4',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Cart Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #dcdfe4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} /> Active Bill Cart
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                style={{ background: 'none', border: 'none', color: '#d9381e', fontSize: '12px', cursor: 'pointer' }}
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart Line Items */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            {selectedAppointment && (
              <div style={{
                background: '#edf2ff',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '12px',
                border: '1px solid #cce0ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#0066cc' }}>
                    Appointment Settlement
                  </span>
                  <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSelectedAppointment(null)} />
                </div>
                <div style={{ fontSize: '12px', color: '#4f566b' }}>{selectedAppointment.offering_name}</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1f36', marginTop: '6px' }}>
                  {formatCurrency(selectedAppointment.balance_due_minor)}
                </div>
              </div>
            )}

            {cart.length === 0 && !selectedAppointment ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#8792a2' }}>
                Cart is empty. Select products or appointment to start billing.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.variantId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f2f5'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: '#697386' }}>{formatCurrency(item.priceMinor)} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.variantId, -1)}
                      style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #dcdfe4', background: '#fff', cursor: 'pointer' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, 1)}
                      style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #dcdfe4', background: '#fff', cursor: 'pointer' }}
                    >
                      <Plus size={12} />
                    </button>
                    <div style={{ width: '70px', textAlign: 'right', fontWeight: '700', fontSize: '14px' }}>
                      {formatCurrency(item.priceMinor * item.quantity)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Controls */}
          <div style={{ padding: '16px', borderTop: '1px solid #dcdfe4', background: '#fafbfc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#697386' }}>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>{formatCurrency(grandTotalMinor)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
              <span>Total Payable:</span>
              <span style={{ color: '#0066cc' }}>{formatCurrency(grandTotalMinor)}</span>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {(['CASH', 'CARD', 'UPI'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: paymentMethod === m ? '2px solid #0066cc' : '1px solid #dcdfe4',
                    background: paymentMethod === m ? '#edf2ff' : '#fff',
                    color: paymentMethod === m ? '#0066cc' : '#1a1f36',
                    fontWeight: '600',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod === 'CASH' && (
              <div style={{ marginBottom: '14px' }}>
                <input
                  type="number"
                  placeholder={`Cash Received (e.g. ${(grandTotalMinor / 100).toFixed(0)})`}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dcdfe4', fontSize: '14px' }}
                />
              </div>
            )}

            <button
              disabled={submitting || grandTotalMinor <= 0}
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '6px',
                border: 'none',
                background: grandTotalMinor > 0 ? '#0d8a3e' : '#a2d6b1',
                color: '#fff',
                fontWeight: '700',
                fontSize: '16px',
                cursor: grandTotalMinor > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              {submitting ? 'Processing Sale...' : `Complete Sale • ${formatCurrency(grandTotalMinor)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Opening Register Modal */}
      {isOpeningModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '400px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Open Register Session</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Opening Cash Float (INR)</label>
              <input
                type="number"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #dcdfe4' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setIsOpeningModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dcdfe4', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleOpenRegister} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0d8a3e', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Open Register</button>
            </div>
          </div>
        </div>
      )}

      {/* Closing Register Modal */}
      {isClosingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '400px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Close Register (Z-Report)</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Actual Cash Counted in Drawer (INR)</label>
              <input
                type="number"
                required
                placeholder="Enter physical cash in drawer"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #dcdfe4' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setIsClosingModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dcdfe4', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCloseRegister} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#d9381e', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Generate Z-Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Z-Report Dialog */}
      {zReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '420px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' }}>Register Z-Report</h3>
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Opening Float:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(zReport.openingFloatMinor)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Expected Cash:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(zReport.expectedCashMinor)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Actual Counted:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(zReport.closingCashMinor)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dcdfe4', paddingTop: '8px', marginTop: '8px' }}>
                <span>Drawer Variance:</span>
                <span style={{ fontWeight: '700', color: zReport.varianceMinor === 0 ? '#0d8a3e' : '#d9381e' }}>
                  {formatCurrency(zReport.varianceMinor)}
                </span>
              </div>
            </div>
            <button onClick={() => setZReport(null)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Close Report</button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '8px', width: '380px', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <CheckCircle size={44} color="#0d8a3e" style={{ margin: '0 auto 8px auto' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Sale Receipt</h3>
              <p style={{ margin: '4px 0 0 0', color: '#697386', fontSize: '13px' }}>Order {receipt.orderNumber}</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Amount Paid:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(receipt.totalAmountMinor)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Method:</span>
                <span style={{ fontWeight: '600' }}>{receipt.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Cash Tendered:</span>
                <span style={{ fontWeight: '600' }}>{formatCurrency(receipt.cashTenderedMinor)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dcdfe4', paddingTop: '8px', marginTop: '8px' }}>
                <span>Change Due:</span>
                <span style={{ fontWeight: '700', color: '#0d8a3e' }}>{formatCurrency(receipt.changeDueMinor)}</span>
              </div>
            </div>
            <button onClick={() => setReceipt(null)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#0066cc', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
