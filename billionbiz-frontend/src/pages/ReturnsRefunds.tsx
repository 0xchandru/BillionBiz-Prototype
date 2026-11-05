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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formReason, setFormReason] = useState('DAMAGED_ITEM');
  const [formAmount, setFormAmount] = useState('');

  const fetchReturns = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.getReturns();
      setReturnsList(res.returns || []);
    } catch (err: any) {
      setLoadError(err.message || 'Return requests could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReturns();
  }, []);

  const handleApproveReturn = async (id: string) => {
    setActionError(null);
    setNotice(null);
    try {
      await api.approveReturn(id);
      setNotice('Return request approved. No payment has been sent.');
      await fetchReturns();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve return.');
    }
  };

  const handleRejectReturn = async (id: string) => {
    const reason = window.prompt('Please specify the reason for return rejection:');
    if (!reason?.trim()) return;
    setActionError(null);
    setNotice(null);
    try {
      await api.rejectReturn(id, reason.trim());
      setNotice('Return request rejected.');
      await fetchReturns();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject return.');
    }
  };

  const handleCreateReturn = async (e: FormEvent) => {
    e.preventDefault();
    const orderNumber = formOrderNumber.trim().toUpperCase();
    const amount = Number(formAmount);
    const amountMinor = Math.round(amount * 100);

    if (!orderNumber) {
      setActionError('Enter an order number.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(amountMinor)) {
      setActionError('Enter a valid refund request amount greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setNotice(null);
    try {
      const orderResult = await api.getOrders({ search: orderNumber });
      const order = (orderResult.orders || []).find(
        (item: any) => String(item.order_number || '').toUpperCase() === orderNumber
      );
      if (!order) {
        throw new Error('Order number was not found in this store. Check the number and try again.');
      }
      if (amountMinor > Number(order.total_minor)) {
        throw new Error('Requested refund cannot exceed the order total.');
      }

      const idempotencyKey = typeof window !== 'undefined' && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `return-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const result = await api.createReturn({
        orderId: order.id,
        reason: formReason,
        refundAmountMinor: amountMinor,
        items: [],
        restockDisposition: 'RESTOCK'
      }, idempotencyKey);

      setShowAddModal(false);
      setFormOrderNumber('');
      setFormAmount('');
      setFormReason('DAMAGED_ITEM');
      setActiveTab('pending');
      setNotice(`Return request ${result.returnNumber} was saved for order ${order.order_number}. It is awaiting review; no refund has been processed.`);
      await fetchReturns();
    } catch (err: any) {
      setActionError(err.message || 'The return request could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingReturn = (status: string | undefined) =>
    status === 'REQUESTED' || status === 'PENDING' || !status;
  const isRefundSettled = (item: any) =>
    item.status === 'REFUNDED' || (item.status === 'COMPLETED' && item.refund_status === 'PROCESSED');

  const filteredReturns = returnsList.filter((r) => {
    const matchesSearch =
      r.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'pending') return isPendingReturn(r.status);
    if (activeTab === 'approved') return r.status === 'APPROVED';
    if (activeTab === 'refunded') return isRefundSettled(r);
    if (activeTab === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  const countPending = returnsList.filter((r) => isPendingReturn(r.status)).length;
  const countApproved = returnsList.filter((r) => r.status === 'APPROVED').length;
  const countRefunded = returnsList.filter((r) => isRefundSettled(r)).length;
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
            Review and approve requests. Refund settlement is recorded only after the original payment provider confirms it.
          </p>
        </div>

        <button
          onClick={() => { setActionError(null); setNotice(null); setShowAddModal(true); }}
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

      {notice && <div role="status" style={{ marginBottom: '16px', padding: '12px 14px', border: '1px solid #bfdbfe', borderRadius: '9px', background: '#eff6ff', color: '#1e40af', fontSize: '13px' }}>{notice}</div>}
      {actionError && !showAddModal && <div role="alert" style={{ marginBottom: '16px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: '9px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{actionError}</div>}

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
      ) : loadError ? (
        <div role="alert" style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', color: '#991b1b' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px' }}>{loadError}</p>
          <button type="button" onClick={() => void fetchReturns()} style={{ minHeight: '40px', padding: '0 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
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
          onAction={() => { setActionError(null); setNotice(null); setShowAddModal(true); }}
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
                      {isPendingReturn(ret.status) && (
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
                      {isRefundSettled(ret) && (
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>Provider confirmed</span>
                      )}
                      {ret.status === 'APPROVED' && (
                        <span title="No refund API is connected to the payment provider" style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>Refund integration unavailable</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Return Modal */}
      {showAddModal && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) setShowAddModal(false);
          }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.56)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)' }}
          >
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <h2 id="return-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Record return request</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>The order is looked up from your store records.</p>
              </div>
              <button type="button" disabled={isSubmitting} onClick={() => setShowAddModal(false)} aria-label="Close return dialog" style={{ width: '40px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>

            <form onSubmit={handleCreateReturn} style={{ padding: '22px' }}>
              <label htmlFor="return-order-number" style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#475569', marginBottom: '6px' }}>Order number *</label>
              <input id="return-order-number" type="text" required maxLength={64} placeholder="e.g. BBZ-1001" value={formOrderNumber} onChange={(event) => setFormOrderNumber(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '16px' }} />

              <label htmlFor="return-reason" style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#475569', marginBottom: '6px' }}>Reason for return *</label>
              <select id="return-reason" required value={formReason} onChange={(event) => setFormReason(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', marginBottom: '16px' }}>
                <option value="DAMAGED_ITEM">Damaged on arrival</option>
                <option value="WRONG_SIZE">Wrong size / fit</option>
                <option value="DEFECTIVE">Product defective</option>
                <option value="BUYER_REMORSE">Changed mind</option>
              </select>

              <label htmlFor="return-amount" style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#475569', marginBottom: '6px' }}>Requested refund amount (₹) *</label>
              <input id="return-amount" type="number" min="0.01" step="0.01" required placeholder="e.g. 1500.00" value={formAmount} onChange={(event) => setFormAmount(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '14px' }} />

              {actionError && <div role="alert" style={{ padding: '10px 12px', marginBottom: '14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px' }}>{actionError}</div>}

              <div style={{ padding: '11px 12px', marginBottom: '18px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '11px', lineHeight: 1.5 }}>
                This records a request only. Approval does not transfer money. Your platform does not yet have a verified refund-provider API, so the original payment must be refunded through the provider.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" disabled={isSubmitting} onClick={() => setShowAddModal(false)} style={{ minHeight: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ minHeight: '42px', padding: '0 18px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 650, color: '#fff', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.65 : 1 }}>{isSubmitting ? 'Saving request…' : 'Create request'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ReturnsRefundsPage;
