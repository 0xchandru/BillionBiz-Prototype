import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  RefreshCw, 
  Search,
  X, 
  Trash2 
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [responsibilities, setResponsibilities] = useState<any[]>([
    { id: 'APPOINTMENT_STAFF', name: 'Appointment Staff', description: 'Can be assigned to client bookings and services' },
    { id: 'CASHIER', name: 'Counter Staff / Cashier', description: 'Can operate POS registers and cash floats' },
    { id: 'ADMIN_STAFF', name: 'Admin Staff', description: 'Catalog, pricing, and store configuration access' },
    { id: 'MANAGER', name: 'Manager', description: 'Operational oversight across orders, staff, and shifts' },
    { id: 'FULFILLMENT_STAFF', name: 'Fulfillment Specialist', description: 'Order packing, courier dispatch, and shipments' }
  ]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Invite / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState('MANAGER');
  const [pin, setPin] = useState('1234');
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([
    'APPOINTMENT_STAFF',
    'CASHIER'
  ]);
  const [submitting, setSubmitting] = useState(false);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [memRes, rolRes, respRes] = await Promise.all([
        api.getTeamMembers(),
        api.getRoles(),
        api.getResponsibilities().catch(() => ({ responsibilities: [] }))
      ]);

      setMembers(memRes.members || []);
      setRoles(rolRes.roles || []);
      if (respRes.responsibilities && respRes.responsibilities.length > 0) {
        setResponsibilities(respRes.responsibilities);
      }
    } catch (err) {
      console.error('Failed to load team data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setDisplayName('');
    setEmail('');
    setPhone('');
    setRoleCode(roles[0]?.code || 'MANAGER');
    setPin('1234');
    setSelectedResponsibilities(['APPOINTMENT_STAFF', 'CASHIER']);
    setIsModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setDisplayName(member.display_name || '');
    setEmail(member.member_email || member.email || '');
    setPhone(member.phone || '');
    setRoleCode(member.role_code || 'MANAGER');
    setPin('');
    let resp: string[] = ['APPOINTMENT_STAFF', 'CASHIER'];
    if (member.responsibilities) {
      resp = Array.isArray(member.responsibilities) ? member.responsibilities : [member.responsibilities];
    }
    setSelectedResponsibilities(resp);
    setIsModalOpen(true);
  };

  const toggleResponsibility = (respId: string) => {
    if (selectedResponsibilities.includes(respId)) {
      setSelectedResponsibilities(selectedResponsibilities.filter(r => r !== respId));
    } else {
      setSelectedResponsibilities([...selectedResponsibilities, respId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingMember) {
        await api.updateTeamMember(editingMember.id, {
          displayName,
          email: email || undefined,
          phone: phone || undefined,
          roleCode,
          pin: pin || undefined,
          responsibilities: selectedResponsibilities,
          isActive: editingMember.is_active ?? true
        });
        alert('Team member updated successfully!');
      } else {
        await api.createTeamMember({
          displayName,
          email: email || undefined,
          phone: phone || undefined,
          roleCode,
          pin,
          responsibilities: selectedResponsibilities
        });
        alert('Team member created successfully!');
      }
      setIsModalOpen(false);
      await loadTeamData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your organization?`)) return;
    try {
      await api.deleteTeamMember(id);
      await loadTeamData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove team member');
    }
  };

  // Helper to get responsibility badge color
  const getBadgeStyle = (code: string) => {
    switch (code) {
      case 'APPOINTMENT_STAFF':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'Appointment Staff' };
      case 'CASHIER':
        return { bg: '#dcfce7', color: '#15803d', label: 'Cashier / POS' };
      case 'ADMIN_STAFF':
        return { bg: '#ede9fe', color: '#6d28d9', label: 'Admin Staff' };
      case 'MANAGER':
        return { bg: '#fef3c7', color: '#b45309', label: 'Store Manager' };
      case 'FULFILLMENT_STAFF':
        return { bg: '#ffedd5', color: '#c2410c', label: 'Fulfillment' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: code };
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.display_name?.toLowerCase().includes(q) ||
      m.member_email?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.includes(q) ||
      m.role_name?.toLowerCase().includes(q) ||
      m.role_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Team</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Team Members</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Team Members
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Universal team management: assign multi-operational responsibilities (appointments + cashier) without duplicate profiles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={loadTeamData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#0d9488',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Plus size={15} />
            <span>Add Team Member</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search team members by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* TEAM MEMBERS TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ padding: '24px' }}>
              <TableSkeleton rows={4} columns={6} />
            </div>
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search ? 'No team members match your search' : 'No team members added'}
              description={search ? 'Try adjusting your search criteria.' : 'Invite employees, assign operational responsibilities (stylist, cashier, manager), and configure cashier PINs.'}
              actionLabel={search ? undefined : 'Add Team Member'}
              onAction={search ? undefined : openAddModal}
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 18px' }}>Staff Name</th>
                  <th style={{ padding: '14px 18px' }}>Contact Details</th>
                  <th style={{ padding: '14px 18px' }}>System Role</th>
                  <th style={{ padding: '14px 18px' }}>Operational Responsibilities</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => {
                  let memberResp: string[] = [];
                  if (m.responsibilities) {
                    memberResp = Array.isArray(m.responsibilities)
                      ? m.responsibilities
                      : [m.responsibilities];
                  }

                  return (
                    <tr
                      key={m.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.display_name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{m.store_name || 'All Locations'}</div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: '#334155', fontSize: '13px' }}>{m.member_email || m.email || 'PIN Auth Only'}</div>
                        {m.phone && <div style={{ fontSize: '12px', color: '#64748b' }}>{m.phone}</div>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: m.role_code === 'OWNER' ? '#ecfdf5' : '#f0fdfa',
                            color: m.role_code === 'OWNER' ? '#047857' : '#0d9488'
                          }}
                        >
                          {m.role_name || m.role_code || 'Staff'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {memberResp.length > 0 ? (
                            memberResp.map((code) => {
                              const b = getBadgeStyle(code);
                              return (
                                <span
                                  key={code}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: b.bg,
                                    color: b.color
                                  }}
                                >
                                  {b.label}
                                </span>
                              );
                            })
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>None assigned</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: m.is_active ? '#dcfce7' : '#fee2e2',
                            color: m.is_active ? '#15803d' : '#b91c1c'
                          }}
                        >
                          {m.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(m)}
                            style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#334155', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                          >
                            Edit
                          </button>
                          {m.role_code !== 'OWNER' && (
                            <button
                              onClick={() => handleDeleteMember(m.id, m.display_name)}
                              style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleSubmit} style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsModalOpen(false)} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="rahul@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>System Role *</label>
                <select
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', background: '#fff' }}
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.code}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  POS Cashier PIN {editingMember && '(leave empty to keep)'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="4-6 digits"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Operational Responsibilities Multi-Select Checkboxes */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Operational Responsibilities (Multi-Role Support)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {responsibilities.map((resp) => {
                  const isChecked = selectedResponsibilities.includes(resp.id);
                  return (
                    <label key={resp.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1e293b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleResponsibility(resp.id)}
                        style={{ accentColor: '#0d9488' }}
                      />
                      <div>
                        <span style={{ fontWeight: 600 }}>{resp.name}</span>
                        <span style={{ color: '#64748b', marginLeft: '6px', fontSize: '12px' }}>– {resp.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {submitting ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
