import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Plus, 
  X, 
  Calendar, 
  ShoppingBag, 
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../api/services';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

const formatCurrency = (minor: number) => {
  return '₹' + (minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const PeoplePage: FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers({ search: search || undefined });
      setCustomers(res.customers || []);
    } catch (err) {
      console.error('[PeoplePage] Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !email.trim()) return;

    setSubmitting(true);
    try {
      await api.createCustomer({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        addressLine1: addressLine1.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        postalCode: postalCode.trim() || undefined
      });
      setIsAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setAddressLine1('');
      setCity('');
      setState('');
      setPostalCode('');
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    try {
      setLoadingDetails(true);
      const res = await api.getCustomerById(cust.id);
      setCustomerDetails(res);
    } catch (err) {
      console.error('Failed to load customer details', err);
      setCustomerDetails({
        customer: cust,
        orders: [],
        bookings: []
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCustomers = customers;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>People & CRM</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Customers</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Customer Directory & Profiles</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Authoritative directory of registered customer accounts, order history, and service clients.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#083e47',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Customers</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{customers.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Repeat Buyers</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#083e47', marginTop: '6px' }}>
            {customers.filter(c => parseInt(c.total_orders || '0', 10) > 1).length}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Client Value</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {formatCurrency(customers.reduce((sum, c) => sum + (c.total_spent_minor || 0), 0))}
          </div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonLoader count={5} height={70} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Customers Found"
          description={
            search
              ? 'No customer records match your filter criteria.'
              : 'There are no customer records logged yet. Add your first customer profile manually or wait for online store checkouts.'
          }
          actionLabel="Add Customer"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>CUSTOMER NAME</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>CONTACT DETAILS</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>TOTAL ORDERS</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>LIFETIME VALUE</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>REGISTERED</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr 
                  key={c.id} 
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => handleOpenCustomer(c)}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {c.first_name} {c.last_name || ''}
                    </div>
                    {c.default_address?.city && (
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={11} /> {c.default_address.city}, {c.default_address.state || c.default_address.country}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {c.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontSize: '12px' }}>
                        <Mail size={12} style={{ color: '#083e47' }} /> {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                        <Phone size={12} /> {c.phone}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#0f172a', fontWeight: 600 }}>
                    {c.total_orders || 0}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#16a34a', fontWeight: 600 }}>
                    {formatCurrency(c.total_spent_minor || 0)}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCustomer(c);
                      }}
                      style={{
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#083e47',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Profile Side Drawer */}
      {selectedCustomer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 1000
          }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              width: '100%',
              maxWidth: '520px',
              height: '100%',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '-10px 0 25px rgba(0, 0, 0, 0.08)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  {selectedCustomer.first_name} {selectedCustomer.last_name || ''}
                </h2>
                <span style={{ fontSize: '12px', color: '#083e47', fontFamily: 'monospace' }}>
                  {selectedCustomer.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingDetails ? (
              <SkeletonLoader count={4} height={60} />
            ) : (
              <div>
                {/* Contact & Metrics */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Orders Count</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                        {selectedCustomer.total_orders || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total Spent</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                        {formatCurrency(selectedCustomer.total_spent_minor || 0)}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '16px' }}>
                    {selectedCustomer.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', marginBottom: '8px' }}>
                        <Mail size={14} style={{ color: '#083e47' }} /> {selectedCustomer.email}
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px' }}>
                        <Phone size={14} style={{ color: '#16a34a' }} /> {selectedCustomer.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Orders */}
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={15} style={{ color: '#083e47' }} /> Recent Store Orders
                </h3>
                {customerDetails?.orders && customerDetails.orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {customerDetails.orders.map((ord: any) => (
                      <div key={ord.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{ord.order_number}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(ord.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: '#16a34a', fontSize: '13px' }}>{formatCurrency(ord.total_minor)}</div>
                          <div style={{ fontSize: '11px', color: '#083e47', fontWeight: 600 }}>{ord.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginBottom: '24px' }}>
                    No order history recorded for this customer yet.
                  </div>
                )}

                {/* Service Appointments */}
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} style={{ color: '#083e47' }} /> Booking History
                </h3>
                {customerDetails?.bookings && customerDetails.bookings.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customerDetails.bookings.map((bkg: any) => (
                      <div key={bkg.id} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{bkg.service_name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {new Date(bkg.start_time).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{formatCurrency(bkg.total_minor)}</div>
                          <div style={{ fontSize: '11px', color: '#083e47', fontWeight: 600 }}>{bkg.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                    No appointment booking records found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Add New Customer</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '13px' }}>
              Create a customer profile to track purchases, addresses, and bookings.
            </p>

            <form onSubmit={handleCreateCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sarah"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Jenkins"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g., 42 High Street, Suite 100"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="560001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#083e47',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Creating...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeoplePage;
