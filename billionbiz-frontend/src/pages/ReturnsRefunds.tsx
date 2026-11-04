import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  RotateCcw,
  Plus,
  Search
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const ReturnsRefundsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'refunded' | 'rejected'>('pending');
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formReason, setFormReason] = useState('DAMAGED_ITEM');
  const [formAmount, setFormAmount] = useState('');

  const fetchReturns = () => {
    setLoading(true);
    api.getReturns()
      .then((res) => {
        setReturnsList(res.returns || []);
      })
      .catch((err) => {
        console.error('Failed to load returns', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleApproveReturn = async (id: string) => {
    try {
      await api.approveReturn(id);
      fetchReturns();
    } catch (err: any) {
      alert(err.message || 'Failed to approve return');
    }
  };

  const handleRejectReturn = async (id: string) => {
    const reason = window.prompt('Please specify the reason for return rejection:');
    if (!reason) return;
    try {
      await api.rejectReturn(id, reason);
      fetchReturns();
    } catch (err: any) {
      alert(err.message || 'Failed to reject return');
    }
  };

  const handleProcessRefund = async (id: string) => {
    if (!window.confirm('Confirm settlement of payment refund to original source?')) return;
    try {
      await api.refundReturn(id);
      fetchReturns();
    } catch (err: any) {
      alert(err.message || 'Failed to process refund');
    }
  };

  const handleCreateReturn = (e: FormEvent) => {
    e.preventDefault();
    if (!formOrderNumber.trim() || !formAmount.trim()) {
      alert('Order number and refund amount are required.');
      return;
    }

    setIsSubmitting(true);
    const newReturn = {
      id: `ret-${Date.now()}`,
      order_number: formOrderNumber.trim().toUpperCase(),
      customer_name: formCustomerName.trim() || 'Valued Customer',
      reason: formReason,
      refund_amount_minor: Math.round(parseFloat(formAmount) * 100),
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    setTimeout(() => {
      setReturnsList((prev) => [newReturn, ...prev]);
      setIsSubmitting(false);
      setShowAddModal(false);
      setFormOrderNumber('');
      setFormCustomerName('');
      setFormAmount('');
    }, 300);
  };

  const filteredReturns = returnsList.filter((r) => {
    const matchesSearch =
      r.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'pending') return r.status === 'PENDING' || !r.status;
    if (activeTab === 'approved') return r.status === 'APPROVED';
    if (activeTab === 'refunded') return r.status === 'REFUNDED';
    if (activeTab === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  const countPending = returnsList.filter((r) => r.status === 'PENDING' || !r.status).length;
  const countApproved = returnsList.filter((r) => r.status === 'APPROVED').length;
  const countRefunded = returnsList.filter((r) => r.status === 'REFUNDED').length;
  const countRejected = returnsList.filter((r) => r.status === 'REJECTED').length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RotateCcw size={26} color="#0d9488" />
            Returns & Customer Refunds
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Inspect return requests, authorize replacements, and process monetary refunds.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)'
          }}
        >
          <Plus size={16} />
          New Return Request
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>{countPending}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Approved Returns</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284c7', marginTop: '6px' }}>{countApproved}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Refunded Settled</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>{countRefunded}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase' }}>Rejected</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>{countRejected}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'pending' ? 600 : 500,
            color: activeTab === 'pending' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Pending Review ({countPending})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'approved' ? 600 : 500,
            color: activeTab === 'approved' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'approved' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Approved ({countApproved})
        </button>
        <button
          onClick={() => setActiveTab('refunded')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'refunded' ? 600 : 500,
            color: activeTab === 'refunded' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'refunded' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Refunded ({countRefunded})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'rejected' ? 600 : 500,
            color: activeTab === 'rejected' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'rejected' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Rejected ({countRejected})
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search return by order # or reason..."
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
          <TableSkeleton rows={4} columns={6} />
        </div>
      ) : filteredReturns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title={searchQuery ? 'No matching returns' : `No ${activeTab} return requests`}
          description={
            searchQuery
              ? 'No return requests matched your search query.'
              : 'Customer returns, RMA replacements, and refund claims will be organized here.'
          }
          actionLabel="Record Return Request"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Order Number</th>
                <th style={{ padding: '14px 18px' }}>Customer</th>
                <th style={{ padding: '14px 18px' }}>Return Reason</th>
                <th style={{ padding: '14px 18px' }}>Refund Amount</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((ret) => (
                <tr key={ret.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0d9488' }}>
                    {ret.order_number}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#0f172a' }}>
                    {ret.customer_name || 'Retail Shopper'}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>
                    {ret.reason || 'Customer Return'}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    ₹{((ret.refund_amount_minor || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background:
                          ret.status === 'REFUNDED'
                            ? '#dcfce7'
                            : ret.status === 'APPROVED'
                            ? '#e0f2fe'
                            : ret.status === 'REJECTED'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          ret.status === 'REFUNDED'
                            ? '#15803d'
                            : ret.status === 'APPROVED'
                            ? '#0369a1'
                            : ret.status === 'REJECTED'
                            ? '#b91c1c'
                            : '#b45309'
                      }}
                    >
                      {ret.status || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {(ret.status === 'PENDING' || !ret.status) && (
                        <>
                          <button
                            onClick={() => handleApproveReturn(ret.id)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#0d9488',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectReturn(ret.id)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid #fca5a5',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {ret.status === 'APPROVED' && (
                        <button
                          onClick={() => handleProcessRefund(ret.id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '6px',
                            border: '1px solid #0d9488',
                            background: '#f0fdfa',
                            color: '#0d9488',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Process Refund
                        </button>
                      )}
                      {ret.status === 'REFUNDED' && (
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Refund Settled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Return Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Record Customer Return
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Order Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BBZ-1001"
                  value={formOrderNumber}
                  onChange={(e) => setFormOrderNumber(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Reason for Return
                  </label>
                  <select
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="DAMAGED_ITEM">Damaged on Arrival</option>
                    <option value="WRONG_SIZE">Wrong Size / Fit</option>
                    <option value="DEFECTIVE">Product Defective</option>
                    <option value="BUYER_REMORSE">Changed Mind</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Refund Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="e.g. 1500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Recording...' : 'Record Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsRefundsPage;
