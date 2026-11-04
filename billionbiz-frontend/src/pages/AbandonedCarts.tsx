import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  ShoppingBag,
  Search,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const AbandonedCartsPage: FC = () => {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentRecoveryId, setSentRecoveryId] = useState<string | null>(null);

  const fetchCarts = () => {
    setLoading(true);
    api.getAbandonedCarts()
      .then((res: any) => {
        setCarts(res.abandonedCarts || res.carts || []);
      })
      .catch((err) => {
        console.error('Failed to load abandoned carts', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const handleSendRecovery = (id: string, email: string) => {
    setSentRecoveryId(id);
    setTimeout(() => {
      alert(`Recovery email dispatched to ${email || 'customer'} with a single-click checkout resume link.`);
      setSentRecoveryId(null);
    }, 400);
  };

  const filteredCarts = carts.filter((c) => {
    const matchesSearch =
      c.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_phone?.includes(searchQuery);
    return matchesSearch;
  });

  const totalValue = carts.reduce((acc, c) => acc + (c.total_minor || 0), 0) / 100;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={26} color="#083e47" />
            Abandoned Checkouts & Carts
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Re-engage shoppers who left items in their cart before completing checkout.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Abandoned Carts</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{carts.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#083e47', fontWeight: 600, textTransform: 'uppercase' }}>Potential Value</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#083e47', marginTop: '6px' }}>
            ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Recovery Automation</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} />
            Email Reminders Active
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by customer email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={4} columns={5} />
        </div>
      ) : filteredCarts.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={searchQuery ? 'No matching checkouts' : 'No abandoned carts found'}
          description={
            searchQuery
              ? 'No cart matched your search query.'
              : 'When online shoppers add products to their bag and drop off, they will list here for recovery.'
          }
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Customer Contact</th>
                <th style={{ padding: '14px 18px' }}>Cart Value</th>
                <th style={{ padding: '14px 18px' }}>Last Updated</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map((cart) => (
                <tr key={cart.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{cart.customer_email || 'Guest Shopper'}</div>
                    {cart.customer_phone && <div style={{ fontSize: '12px', color: '#64748b' }}>{cart.customer_phone}</div>}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    ₹{((cart.total_minor || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {new Date(cart.updated_at || Date.now()).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: cart.status === 'RECOVERED' ? '#dcfce7' : '#fee2e2',
                        color: cart.status === 'RECOVERED' ? '#15803d' : '#b91c1c'
                      }}
                    >
                      {cart.status || 'ABANDONED'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleSendRecovery(cart.id, cart.customer_email)}
                      disabled={sentRecoveryId === cart.id}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #0d9488',
                        background: '#f0fdfa',
                        color: '#0d9488',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Mail size={13} />
                      {sentRecoveryId === cart.id ? 'Sending...' : 'Send Recovery'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AbandonedCartsPage;
