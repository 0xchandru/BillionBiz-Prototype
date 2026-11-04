import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const InvoicesPage: FC<{ defaultTab?: 'create' | 'issued' | 'drafts' | 'paid' }> = ({
  defaultTab = 'issued'
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'issued' | 'drafts' | 'paid'>(defaultTab);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Invoice Builder State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState('NET_15');
  const [notes, setNotes] = useState('Payment is requested within agreed credit terms. Thank you for your business.');
  const [lineItems, setLineItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number; taxRate: number }>>([
    { id: 'item-1', description: 'Consulting & Setup Services', quantity: 1, unitPrice: 2500, taxRate: 18 }
  ]);

  const fetchInvoices = () => {
    setLoading(true);
    api.getInvoices()
      .then((res) => {
        setInvoices(res.invoices || []);
      })
      .catch((err) => {
        console.error('Failed to load invoices', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, taxRate: 18 }
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
  const grandTotal = subtotal + taxTotal;

  const handleIssueInvoice = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Customer name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createInvoice({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        invoiceNumber,
        subtotalMinor: Math.round(subtotal * 100),
        taxMinor: Math.round(taxTotal * 100),
        totalMinor: Math.round(grandTotal * 100),
        dueDate,
        paymentTerms,
        notes,
        items: lineItems
      });

      setSubmitSuccess(true);
      fetchInvoices();
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('issued');
        // Reset form
        setCustomerName('');
        setCustomerEmail('');
        setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to issue invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'paid') return inv.status === 'PAID';
    if (activeTab === 'drafts') return inv.status === 'DRAFT';
    return true;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={26} color="#0d9488" />
            Invoices & Commercial Billing
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Generate GST-compliant tax invoices, track credit terms, and manage commercial payments.
          </p>
        </div>

        {activeTab !== 'create' ? (
          <button
            onClick={() => setActiveTab('create')}
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
            Create New Invoice
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('issued')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            View Issued Invoices
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('issued')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'issued' ? 600 : 500,
            color: activeTab === 'issued' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'issued' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Issued Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'create' ? 600 : 500,
            color: activeTab === 'create' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'create' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Create New Invoice
        </button>
        <button
          onClick={() => setActiveTab('paid')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'paid' ? 600 : 500,
            color: activeTab === 'paid' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'paid' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Paid Invoices
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'drafts' ? 600 : 500,
            color: activeTab === 'drafts' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'drafts' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Drafts
        </button>
      </div>

      {/* VIEW 1: CREATE NEW INVOICE */}
      {activeTab === 'create' && (
        <form onSubmit={handleIssueInvoice} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {submitSuccess && (
            <div style={{ padding: '14px 18px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '14px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              Invoice issued successfully! Redirecting to list...
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
            {/* Customer Details */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Bill To Customer
              </h3>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Enterprises Pvt Ltd"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Billing Email
                </label>
                <input
                  type="email"
                  placeholder="accounts@ramesh.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                />
              </div>
            </div>

            {/* Invoice Meta */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Invoice Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff', fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                  >
                    <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                    <option value="NET_60">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Itemized Products & Services
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px', width: '45%' }}>Description</th>
                  <th style={{ padding: '12px 14px', width: '15%' }}>Quantity</th>
                  <th style={{ padding: '12px 14px', width: '20%' }}>Unit Price (₹)</th>
                  <th style={{ padding: '12px 14px', width: '10%' }}>Tax (%)</th>
                  <th style={{ padding: '12px 14px', width: '10%', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '12px 14px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Item or service description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <select
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      ₹{((item.quantity * item.unitPrice) * (1 + item.taxRate / 100)).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={handleAddLineItem}
              style={{
                marginTop: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px dashed #0d9488',
                background: '#f0fdfa',
                color: '#0d9488',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
              Add Another Line Item
            </button>
          </div>

          {/* Totals & Notes Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Payment Notes & Bank Details
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Estimated GST:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{taxTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '18px', fontWeight: 700, color: '#0d9488' }}>
                <span>Grand Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)'
                }}
              >
                {isSubmitting ? 'Issuing Invoice...' : 'Issue & Send Invoice'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 2: ISSUED INVOICES LIST */}
      {activeTab !== 'create' && (
        <div>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search invoice number, client or email..."
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

          {loading ? (
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <TableSkeleton rows={4} columns={6} />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={searchQuery ? 'No matching invoices' : 'No invoices issued yet'}
              description={
                searchQuery
                  ? 'No invoice matched your search parameters.'
                  : 'Create custom tax invoices with multiple line items, tax brackets, and payment terms.'
              }
              actionLabel="Create First Invoice"
              onAction={() => setActiveTab('create')}
            />
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 18px' }}>Invoice #</th>
                    <th style={{ padding: '14px 18px' }}>Customer</th>
                    <th style={{ padding: '14px 18px' }}>Issue Date</th>
                    <th style={{ padding: '14px 18px' }}>Due Date</th>
                    <th style={{ padding: '14px 18px' }}>Amount</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0d9488' }}>
                        {inv.invoice_number}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{inv.customer_name || 'Commercial Client'}</div>
                        {inv.customer_email && <div style={{ fontSize: '12px', color: '#64748b' }}>{inv.customer_email}</div>}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {new Date(inv.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'Net 15'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                        ₹{((inv.total_minor || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: inv.status === 'PAID' ? '#dcfce7' : '#fef3c7',
                            color: inv.status === 'PAID' ? '#15803d' : '#b45309'
                          }}
                        >
                          {inv.status || 'ISSUED'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => window.print()}
                          title="Print Invoice"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Printer size={13} />
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
