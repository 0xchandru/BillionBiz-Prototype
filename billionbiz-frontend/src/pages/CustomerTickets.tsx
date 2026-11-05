import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { MessageSquare, Plus, Search, CheckCircle, Clock } from 'lucide-react';
import { api } from '../api/services';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const CustomerTickets: FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [replyBusy, setReplyBusy] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomerTickets();
      setTickets(res.tickets || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
      setError(err.message || 'Unable to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !subject.trim()) return;

    setSubmitting(true);
    try {
      await api.createCustomerTicket({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        subject: subject.trim(),
        description: description.trim(),
        priority
      });
      setIsModalOpen(false);
      setCustomerName('');
      setCustomerEmail('');
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.updateCustomerTicket(ticketId, { status: newStatus });
      fetchTickets();
    } catch (err: any) {
      alert(err.message || 'Failed to update ticket status');
    }
  };

  const openTicket = async (ticket: any) => {
    setActiveTicket(ticket);
    try { const result = await api.getCustomerTicketMessages(ticket.id); setMessages(result.messages || []); }
    catch (err: any) { setError(err.message || 'Could not load ticket conversation.'); }
  };
  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeTicket || !reply.trim()) return;
    setReplyBusy(true);
    try { await api.replyCustomerTicket(activeTicket.id, reply.trim()); setReply(''); await openTicket(activeTicket); await fetchTickets(); }
    catch (err: any) { setError(err.message || 'Could not send the reply.'); }
    finally { setReplyBusy(false); }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.customer_email && t.customer_email.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>People & CRM</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Support Tickets</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Customer Inquiries & Support Tickets</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Omnichannel ticket queue directly tied to customer accounts, orders, and appointment bookings.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
          Create Support Ticket
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Tickets</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{tickets.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Open Inquiries</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>
            {tickets.filter(t => t.status === 'OPEN').length}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>In Progress</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#083e47', marginTop: '6px' }}>
            {tickets.filter(t => t.status === 'IN_PROGRESS').length}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resolved & Closed</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length}
          </div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search tickets, subject, customer..."
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
        <SkeletonLoader count={4} height={70} />
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Support Tickets Found"
          description={
            search
              ? 'No tickets match your query.'
              : 'There are no active customer inquiries or support tickets logged.'
          }
          actionLabel="Log Customer Ticket"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>TICKET ID</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>CUSTOMER</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>SUBJECT & DETAILS</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>PRIORITY</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>QUICK ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => (
                <tr key={t.id} onClick={() => void openTicket(t)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                  <td style={{ padding: '16px 20px', fontFamily: 'monospace', color: '#083e47', fontWeight: 600 }}>
                    {t.ticket_number}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.customer_name}</div>
                    {t.customer_email && <div style={{ fontSize: '12px', color: '#64748b' }}>{t.customer_email}</div>}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.subject}</div>
                    {t.description && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor:
                          t.priority === 'URGENT'
                            ? '#fef2f2'
                            : t.priority === 'HIGH'
                            ? '#fff7ed'
                            : '#f0fdfa',
                        color:
                          t.priority === 'URGENT'
                            ? '#b91c1c'
                            : t.priority === 'HIGH'
                            ? '#c2410c'
                            : '#083e47',
                        border: `1px solid ${
                          t.priority === 'URGENT'
                            ? '#fecaca'
                            : t.priority === 'HIGH'
                            ? '#fed7aa'
                            : '#ccfbf1'
                        }`
                      }}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color:
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? '#16a34a'
                            : t.status === 'IN_PROGRESS'
                            ? '#083e47'
                            : '#d97706'
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor:
                            t.status === 'RESOLVED' || t.status === 'CLOSED'
                              ? '#16a34a'
                              : t.status === 'IN_PROGRESS'
                              ? '#083e47'
                              : '#d97706'
                        }}
                      />
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px' }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    {t.status === 'OPEN' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: '#083e47',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Clock size={12} />
                        Start Working
                      </button>
                    )}
                    {t.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'RESOLVED')}
                        style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#16a34a',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle size={12} />
                        Mark Resolved
                      </button>
                    )}
                    {(t.status === 'RESOLVED' || t.status === 'CLOSED') && (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Ticket Modal */}
      {activeTicket && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: '#0f172a88', display: 'grid', placeItems: 'center', padding: 18 }}>
          <section role="dialog" aria-modal="true" aria-label={`Ticket ${activeTicket.ticket_number}`} style={{ width: 'min(680px, 100%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 14, padding: 22 }}>
            <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><div><h2 style={{ margin: 0 }}>{activeTicket.subject}</h2><p style={{ color: '#64748b', fontSize: 13 }}>{activeTicket.ticket_number} · {activeTicket.customer_name} · {activeTicket.customer_email || 'No email'}</p></div><button type="button" onClick={() => setActiveTicket(null)}>Close</button></header>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 16px', fontSize: 13 }}>Ticket status<select value={activeTicket.status} onChange={async (event) => { const status = event.target.value; await handleUpdateStatus(activeTicket.id, status); setActiveTicket({ ...activeTicket, status }); }}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></label>
            <div style={{ display: 'grid', gap: 10, maxHeight: 360, overflow: 'auto', padding: 12, background: '#f8fafc', borderRadius: 10 }}>{messages.map((message) => <div key={message.id} style={{ maxWidth: '86%', justifySelf: message.author_type === 'STAFF' ? 'end' : 'start', padding: 12, background: message.author_type === 'STAFF' ? '#e0f2fe' : '#fff', border: '1px solid #e2e8f0', borderRadius: 10 }}><div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>{message.author_type === 'STAFF' ? 'Store team' : activeTicket.customer_name}</div><div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{message.body}</div><time style={{ display: 'block', marginTop: 6, fontSize: 10, color: '#64748b' }}>{new Date(message.created_at).toLocaleString()}</time></div>)}</div>
            <form onSubmit={sendReply} style={{ display: 'flex', gap: 8, marginTop: 14 }}><textarea required value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Reply to the customer…" rows={3} style={{ flex: 1, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, resize: 'vertical' }} /><button type="submit" disabled={replyBusy || !reply.trim()} style={{ alignSelf: 'end', padding: '10px 14px' }}>{replyBusy ? 'Sending…' : 'Send reply'}</button></form>
          </section>
        </div>
      )}

      {isModalOpen && (
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
              maxWidth: '540px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Create Support Ticket</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '13px' }}>
              Log an incoming customer support inquiry or service escalation.
            </p>

            <form onSubmit={handleCreateTicket}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Alex Morgan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                    Customer Email
                  </label>
                  <input
                    type="email"
                    placeholder="alex@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Order Delivery Status Inquiry"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
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
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
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
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Issue Description & Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the issue, order number, or client request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {submitting ? 'Creating...' : 'Log Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTickets;
