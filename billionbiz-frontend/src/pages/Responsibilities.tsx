import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Briefcase, Search, Users, UserCheck } from 'lucide-react';
import { api } from '../api/services';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const Responsibilities: FC = () => {
  const [responsibilities, setResponsibilities] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [respRes, membersRes] = await Promise.all([
        api.getResponsibilities(),
        api.getTeamMembers()
      ]);
      setResponsibilities(respRes.responsibilities || []);
      setTeamMembers(membersRes.members || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load operational responsibilities:', err);
      setError(err.message || 'Unable to load operational responsibilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAssignedMembers = (respId: string) => {
    return teamMembers.filter((m) => {
      let resps = m.responsibilities;
      if (typeof resps === 'string') {
        try { resps = JSON.parse(resps); } catch { resps = []; }
      }
      return Array.isArray(resps) && resps.includes(respId);
    });
  };

  const filteredResponsibilities = responsibilities.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Team</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Responsibilities</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Operational Responsibilities</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Multi-responsibility mapping across your workforce. Staff members can hold both Cashier and Appointment specialist responsibilities simultaneously.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Profiles Defined</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{responsibilities.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Personnel</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#083e47', marginTop: '6px' }}>
            {teamMembers.filter(m => m.is_active).length}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Multi-Functional Staff</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {teamMembers.filter(m => {
              let resps = m.responsibilities;
              if (typeof resps === 'string') {
                try { resps = JSON.parse(resps); } catch { resps = []; }
              }
              return Array.isArray(resps) && resps.length > 1;
            }).length}
          </div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search responsibility..."
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
        <SkeletonLoader count={4} height={90} />
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : filteredResponsibilities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Operational Responsibilities Found"
          description={search ? 'No profiles match your search term.' : 'No profiles found.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
          {filteredResponsibilities.map((resp) => {
            const assigned = getAssignedMembers(resp.id);
            return (
              <div
                key={resp.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#f0fdfa',
                          color: '#083e47',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <UserCheck size={18} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>{resp.name}</h3>
                        <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{resp.id}</span>
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: assigned.length > 0 ? '#dcfce7' : '#f1f5f9',
                        color: assigned.length > 0 ? '#16a34a' : '#64748b',
                        border: `1px solid ${assigned.length > 0 ? '#bbf7d0' : '#e2e8f0'}`
                      }}
                    >
                      {assigned.length} ASSIGNED
                    </span>
                  </div>

                  <p style={{ margin: '12px 0 16px', color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                    {resp.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} style={{ color: '#083e47' }} />
                    Active Qualified Personnel ({assigned.length})
                  </div>

                  {assigned.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      No staff members currently assigned to this operational responsibility.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {assigned.map((staff) => (
                        <span
                          key={staff.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            color: '#0f172a'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                          {staff.display_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Responsibilities;
