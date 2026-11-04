import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Shield, Plus, Search, Check, Key } from 'lucide-react';
import { api } from '../api/services';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const RolesPermissions: FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.getRoles(),
        api.getPermissions()
      ]);
      setRoles(rolesRes.roles || []);
      setPermissions(permsRes.permissions || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load roles/permissions:', err);
      setError(err.message || 'Unable to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setSubmitting(true);
    try {
      await api.createCustomRole({
        name: roleName.trim(),
        code: roleCode.trim() || undefined,
        description: description.trim(),
        permissionCodes: selectedPermissions
      });
      setIsModalOpen(false);
      setRoleName('');
      setRoleCode('');
      setDescription('');
      setSelectedPermissions([]);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create custom role');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const filteredRoles = roles.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  // Group permissions by domain for matrix & modal
  const permissionsByDomain = permissions.reduce((acc: any, p: any) => {
    const domain = p.domain || 'general';
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(p);
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Team</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Roles & Permissions</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Access Roles & Permissions Matrix</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Define role boundaries, manage granular capabilities, and enforce enterprise multi-tenant access controls.
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
          Create Custom Role
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Configured Roles</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{roles.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Built-In System Roles</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#083e47', marginTop: '6px' }}>
            {roles.filter(r => r.is_system).length}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Security Permissions</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>{permissions.length}</div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search roles or codes..."
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
        <SkeletonLoader count={4} height={80} />
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Section 1: Configured Roles */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Configured Access Roles
            </h2>
            {filteredRoles.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No Roles Found"
                description={search ? 'No roles match your search term.' : 'No roles configured.'}
                actionLabel="Create Custom Role"
                onAction={() => setIsModalOpen(true)}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                {filteredRoles.map((role) => (
                  <div
                    key={role.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{role.name}</h3>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: role.is_system ? '#f0fdfa' : '#f5f3ff',
                            color: role.is_system ? '#083e47' : '#7c3aed',
                            border: `1px solid ${role.is_system ? '#ccfbf1' : '#ede9fe'}`
                          }}
                        >
                          {role.is_system ? 'SYSTEM' : 'CUSTOM'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', marginBottom: '10px' }}>
                        CODE: {role.code}
                      </div>

                      <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                        {role.description || 'No description provided.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Key size={13} style={{ color: '#083e47' }} />
                        {role.permissions ? role.permissions.length : 0} Permissions Assigned
                      </span>
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Active in Store</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Permissions Matrix View */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Granular Role Capabilities Matrix
            </h2>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600, minWidth: '240px' }}>PERMISSION CODE / DOMAIN</th>
                    {roles.map((r) => (
                      <th key={r.id} style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'center', minWidth: '120px' }}>
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>{p.code}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.description}</div>
                      </td>
                      {roles.map((r) => {
                        const hasPerm = r.permissions && r.permissions.includes(p.code);
                        return (
                          <td key={r.id} style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {hasPerm ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f0fdfa', color: '#083e47' }}>
                                <Check size={14} />
                              </span>
                            ) : (
                              <span style={{ color: '#cbd5e1' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
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
            overflowY: 'auto',
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
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Create Custom Role</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '13px' }}>
              Select specific security permission scopes to craft an operational role for your staff.
            </p>

            <form onSubmit={handleCreateRole}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Inventory Auditor"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
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
                    Role Code (Uppercase Identifier)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., INVENTORY_AUDITOR"
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
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
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dedicated staff member who performs cycle counts and stock audits."
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
                    outline: 'none'
                  }}
                />
              </div>

              {/* Permission Checkboxes by Domain */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Assign Permissions ({selectedPermissions.length} selected)
                </label>
                <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', backgroundColor: '#f8fafc' }}>
                  {Object.entries(permissionsByDomain).map(([domain, perms]: [string, any]) => (
                    <div key={domain} style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#083e47', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        {domain}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
                        {perms.map((p: any) => {
                          const isSelected = selectedPermissions.includes(p.code);
                          return (
                            <label
                              key={p.id}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                fontSize: '12px',
                                color: isSelected ? '#0f172a' : '#64748b',
                                cursor: 'pointer',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                                border: isSelected ? '1px solid #99f6e4' : '1px solid transparent'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePermission(p.code)}
                                style={{ marginTop: '2px' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{p.code}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{p.description}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
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
                  {submitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
