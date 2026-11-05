import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Users, Search, CalendarClock, UserCog } from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const StaffPage: FC = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getTeamMembers();
      const appointmentStaff = (response.members || []).filter((member: any) =>
        member.is_active === true &&
        (Array.isArray(member.responsibilities) ? member.responsibilities : []).includes('APPOINTMENT_STAFF')
      );
      setStaffList(appointmentStaff);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchStaff(); }, []);

  const filteredStaff = staffList.filter((member) => {
    const search = searchQuery.toLowerCase();
    return String(member.display_name || '').toLowerCase().includes(search) ||
      String(member.member_email || member.email || '').toLowerCase().includes(search) ||
      String(member.phone || '').includes(search);
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12, marginBottom: 5 }}>
            <span>Appointments</span><span>/</span><span style={{ color: '#0f766e', fontWeight: 650 }}>Appointment staff</span>
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 750, color: '#0f172a', margin: 0 }}>
            <Users size={25} color="#0d9488" /> Appointment staff roster
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b', maxWidth: 680, lineHeight: 1.6 }}>
            This roster is sourced from Team. A person appears here when the Appointment Staff responsibility is assigned; identities, access roles and deactivation are managed in one place.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/team" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: 12, fontWeight: 650, textDecoration: 'none' }}>
            <UserCog size={14} /> Manage team
          </a>
          <a href="/appointments/working-hours" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 12px', borderRadius: 8, border: 0, background: '#0f766e', color: '#fff', fontSize: 12, fontWeight: 650, textDecoration: 'none' }}>
            <CalendarClock size={14} /> Staff schedules
          </a>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: 420, marginBottom: 18 }}>
        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="search"
          placeholder="Search appointment staff…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 12, background: '#fff' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}><TableSkeleton rows={4} columns={4} /></div>
      ) : error ? (
        <div role="alert" style={{ padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 12 }}>{error}</div>
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? 'No appointment staff match your search' : 'No appointment staff assigned'}
          description={searchQuery ? 'Try another name, email address or phone number.' : 'Open Team, add or edit a person, and assign the Appointment Staff responsibility. The same team profile will then be available for services and schedules.'}
          actionLabel="Open Team"
          onAction={() => { window.location.href = '/team'; }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filteredStaff.map((member) => (
            <article key={member.id} style={{ padding: 18, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: 14, fontWeight: 750, color: '#0f172a', margin: 0 }}>{member.display_name}</h2>
                  <p style={{ margin: '5px 0 0', fontSize: 11, color: '#64748b' }}>{member.role_name || 'Team member'}</p>
                </div>
                <span style={{ padding: '4px 7px', borderRadius: 20, background: '#ecfdf5', color: '#047857', fontSize: 10, fontWeight: 700 }}>ACTIVE</span>
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 5, color: '#475569', fontSize: 11 }}>
                <span>{member.member_email || member.email || 'No email configured'}</span>
                <span>{member.phone || 'No phone configured'}</span>
                <span>{member.store_name || 'Current store'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 14 }}>
                <a href="/team" style={{ flex: 1, textAlign: 'center', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 7, color: '#334155', fontSize: 11, fontWeight: 650, textDecoration: 'none' }}>Edit in Team</a>
                <a href="/appointments/working-hours" style={{ flex: 1, textAlign: 'center', padding: '8px 10px', border: 0, borderRadius: 7, background: '#0f766e', color: '#fff', fontSize: 11, fontWeight: 650, textDecoration: 'none' }}>Manage shifts</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffPage;
