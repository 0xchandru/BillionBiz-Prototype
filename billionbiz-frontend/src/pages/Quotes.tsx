import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export const QuotesPage: FC = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formQuoteNumber, setFormQuoteNumber] = useState(`QTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formCustomerEmail, setFormCustomerEmail] = useState('');
  const [formValidUntil, setFormValidUntil] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('Pricing valid for 30 days from issue. Bulk discount included.');

  const handleCreateQuote = (e: FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formAmount.trim()) {
      alert('Customer name and quote amount are required.');
      return;
    }

    setIsSubmitting(true);
    const newQuote = {
      id: `qte-${Date.now()}`,
      quote_number: formQuoteNumber,
      customer_name: formCustomerName.trim(),
      customer_email: formCustomerEmail.trim(),
      amount_minor: Math.round(parseFloat(formAmount) * 100),
      valid_until: formValidUntil,
      status: 'SENT',
      notes: formNotes,
      created_at: new Date().toISOString()
    };

    setTimeout(() => {
      setQuotes((prev) => [newQuote, ...prev]);
      setIsSubmitting(false);
      setShowAddModal(false);
      setFormQuoteNumber(`QTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormCustomerName('');
      setFormCustomerEmail('');
      setFormAmount('');
    }, 300);
  };

  const handleAcceptQuote = (id: string) => {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'ACCEPTED' } : q))
    );
    alert('Quote marked as accepted! Ready for conversion to live fulfillment order.');
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quote_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Orders</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Quotes & Estimates</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={26} color="#0d9488" />
            Quotes & Price Estimates
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Prepare custom commercial estimates, track client approval status, and convert approved quotes to orders.
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
          Create Quote
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search quote number, customer or email..."
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
      {filteredQuotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery ? 'No matching quotes' : 'No quotes created yet'}
          description={
            searchQuery
              ? 'No quote matches your search query.'
              : 'Prepare customized pricing estimates and formal commercial bids for B2B buyers.'
          }
          actionLabel="Create First Quote"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Quote #</th>
                <th style={{ padding: '14px 18px' }}>Customer</th>
                <th style={{ padding: '14px 18px' }}>Estimated Value</th>
                <th style={{ padding: '14px 18px' }}>Valid Until</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0d9488' }}>
                    {q.quote_number}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{q.customer_name}</div>
                    {q.customer_email && <div style={{ fontSize: '12px', color: '#64748b' }}>{q.customer_email}</div>}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    ₹{((q.amount_minor || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {new Date(q.valid_until).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background:
                          q.status === 'ACCEPTED'
                            ? '#dcfce7'
                            : q.status === 'SENT'
                            ? '#e0f2fe'
                            : '#fef3c7',
                        color:
                          q.status === 'ACCEPTED'
                            ? '#15803d'
                            : q.status === 'SENT'
                            ? '#0369a1'
                            : '#b45309'
                      }}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      {q.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => handleAcceptQuote(q.id)}
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
                          Mark Accepted
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteQuote(q.id)}
                        title="Delete Quote"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Quote Modal */}
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
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Prepare Commercial Quote
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuote} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Quote Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formQuoteNumber}
                    onChange={(e) => setFormQuoteNumber(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Customer / Enterprise Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={formCustomerName}
                  onChange={(e) => setFormCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Customer Email
                  </label>
                  <input
                    type="email"
                    placeholder="procurement@acme.com"
                    value={formCustomerEmail}
                    onChange={(e) => setFormCustomerEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Estimated Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="e.g. 75000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Quote Notes & Terms
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
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
                  {isSubmitting ? 'Creating...' : 'Issue Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
