import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Clock, Plus, CheckCircle2, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';

const DAYS = [
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
  { day: 0, name: 'Sunday' }
];

type Shift = {
  id?: string;
  clientId: string;
  staff_profile_id: string;
  staff_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 7,
  background: '#fff',
  color: '#0f172a',
  fontSize: 12
};

export const WorkingHoursPage: FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHours = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamRes, hoursRes] = await Promise.all([
        api.getTeamMembers(),
        api.getWorkingHours()
      ]);
      const appointmentStaff = (teamRes.members || []).filter((member: any) =>
        member.is_active === true &&
        (Array.isArray(member.responsibilities) ? member.responsibilities : []).includes('APPOINTMENT_STAFF')
      );
      setStaff(appointmentStaff);
      setTimezone(hoursRes.timezone || 'Asia/Kolkata');
      const staffById = new Map(appointmentStaff.map((member: any) => [member.id, member]));
      setShifts((hoursRes.shifts || [])
        .filter((shift: any) => staffById.has(shift.staff_profile_id))
        .map((shift: any) => ({
          id: shift.id,
          clientId: shift.id,
          staff_profile_id: shift.staff_profile_id,
          staff_name: staffById.get(shift.staff_profile_id)?.display_name || shift.staff_name || 'Appointment staff',
          day_of_week: Number(shift.day_of_week),
          start_time: String(shift.start_time).slice(0, 5),
          end_time: String(shift.end_time).slice(0, 5),
          is_active: shift.is_active === true
        })));
    } catch (err: any) {
      setError(err.message || 'Could not load staff schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchHours(); }, []);

  const addShift = (member: any) => {
    setShifts((previous) => [
      ...previous,
      {
        clientId: 'new-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        staff_profile_id: member.id,
        staff_name: member.display_name,
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_active: true
      }
    ]);
  };

  const updateShift = (clientId: string, patch: Partial<Shift>) => {
    setShifts((previous) => previous.map((shift) =>
      shift.clientId === clientId ? { ...shift, ...patch } : shift
    ));
  };

  const removeShift = (shift: Shift) => {
    if (shift.id) {
      updateShift(shift.clientId, { is_active: false });
    } else {
      setShifts((previous) => previous.filter((item) => item.clientId !== shift.clientId));
    }
  };

  const handleSave = async () => {
    const invalid = shifts.find((shift) =>
      shift.is_active &&
      (!/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.start_time) ||
       !/^([01]\d|2[0-3]):[0-5]\d$/.test(shift.end_time) ||
       shift.end_time <= shift.start_time)
    );
    if (invalid) {
      setError('Every active shift must have valid times and its end must be later than its start.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await api.updateWorkingHours(shifts.map((shift) => ({
        ...(shift.id ? { id: shift.id } : { staffProfileId: shift.staff_profile_id }),
        dayOfWeek: shift.day_of_week,
        startTime: shift.start_time,
        endTime: shift.end_time,
        isActive: shift.is_active
      })));
      setSaveSuccess(true);
      await fetchHours();
      window.setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save working hours.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1180, margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 5 }}>Appointments / Schedules</div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 750, color: '#0f172a' }}>Staff working hours</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
            Define one or more weekly shifts for each team member assigned to Appointment Staff. Times are stored in {timezone}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => void fetchHours()} disabled={loading} style={{ ...inputStyle, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button type="button" onClick={() => void handleSave()} disabled={isSaving || loading} style={{ padding: '9px 15px', border: 0, borderRadius: 8, background: '#083e47', color: '#fff', fontSize: 12, fontWeight: 700, cursor: isSaving ? 'wait' : 'pointer' }}>
            {isSaving ? 'Saving…' : 'Save schedules'}
          </button>
        </div>
      </div>

      {error && <div role="alert" style={{ marginBottom: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8, fontSize: 12 }}>{error}</div>}
      {saveSuccess && <div role="status" style={{ marginBottom: 16, padding: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={15} /> Staff schedules saved.</div>}

      {loading ? (
        <div style={{ padding: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <TableSkeleton rows={5} columns={4} />
        </div>
      ) : staff.length === 0 ? (
        <div style={{ padding: 28, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, textAlign: 'center' }}>
          <Clock size={28} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
          <h2 style={{ margin: '0 0 6px', fontSize: 15, color: '#0f172a' }}>No appointment staff assigned</h2>
          <p style={{ maxWidth: 520, margin: '0 auto', fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            Add a person in Team, assign the Appointment Staff responsibility, and they will appear here. Staff identities and appointment resources are shared; this page does not create duplicate specialist profiles.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {staff.map((member) => {
            const memberShifts = shifts
              .filter((shift) => shift.staff_profile_id === member.id)
              .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));
            return (
              <section key={member.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{member.display_name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{member.email || member.phone || 'No contact details'} · {memberShifts.filter((shift) => shift.is_active).length} active shift(s)</div>
                  </div>
                  <button type="button" onClick={() => addShift(member)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#334155', fontSize: 11, fontWeight: 650, cursor: 'pointer' }}>
                    <Plus size={13} /> Add shift
                  </button>
                </div>
                {memberShifts.length === 0 ? (
                  <div style={{ padding: 16, fontSize: 12, color: '#94a3b8' }}>No shifts configured for this staff member.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {memberShifts.map((shift) => (
                      <div key={shift.clientId} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) auto auto auto', alignItems: 'center', gap: 10, padding: '11px 16px', borderTop: '1px solid #f8fafc', opacity: shift.is_active ? 1 : 0.55 }}>
                        <select value={shift.day_of_week} onChange={(event) => updateShift(shift.clientId, { day_of_week: Number(event.target.value) })} style={inputStyle}>
                          {DAYS.map((day) => <option key={day.day} value={day.day}>{day.name}</option>)}
                        </select>
                        <input type="time" value={shift.start_time} onChange={(event) => updateShift(shift.clientId, { start_time: event.target.value })} disabled={!shift.is_active} style={inputStyle} />
                        <input type="time" value={shift.end_time} onChange={(event) => updateShift(shift.clientId, { end_time: event.target.value })} disabled={!shift.is_active} style={inputStyle} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#64748b' }}>
                            <input type="checkbox" checked={shift.is_active} onChange={(event) => updateShift(shift.clientId, { is_active: event.target.checked })} /> Active
                          </label>
                          <button type="button" onClick={() => removeShift(shift)} title={shift.id ? 'Deactivate shift' : 'Remove unsaved shift'} style={{ border: '1px solid #fecaca', background: '#fff', color: '#b91c1c', borderRadius: 7, padding: 7, cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkingHoursPage;
