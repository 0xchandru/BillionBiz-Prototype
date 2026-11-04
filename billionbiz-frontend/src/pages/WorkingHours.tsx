import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Coffee
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';

const DAYS_OF_WEEK = [
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
  { day: 0, name: 'Sunday' }
];

export const WorkingHoursPage: FC = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchHours = () => {
    setLoading(true);
    api.getWorkingHours()
      .then((res: any) => {
        const loadedShifts = res.workingHours || res.shifts || [];
        const mapped = DAYS_OF_WEEK.map((d) => {
          const found = loadedShifts.find((s: any) => s.day_of_week === d.day);
          return {
            day_of_week: d.day,
            name: d.name,
            is_active: found ? found.is_active : d.day !== 0,
            start_time: found ? found.start_time : '09:00',
            end_time: found ? found.end_time : '19:00'
          };
        });
        setShifts(mapped);
      })
      .catch((err) => {
        console.error('Failed to load working hours', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHours();
  }, []);

  const handleToggleDay = (day: number) => {
    setShifts((prev) =>
      prev.map((s) => (s.day_of_week === day ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const handleTimeChange = (day: number, field: 'start_time' | 'end_time', value: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.day_of_week === day ? { ...s, [field]: value } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateWorkingHours(shifts);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save working hours');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Appointments</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Working Hours</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Working Hours & Shifts (IST)
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Configure regular operating windows in Indian Standard Time (Asia/Kolkata, UTC+5:30).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: '#083e47',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)'
          }}
        >
          {isSaving ? 'Saving Changes...' : 'Save Working Hours'}
        </button>
      </div>

      {saveSuccess && (
        <div style={{ padding: '12px 18px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '14px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Working hours updated and live on client appointment booking widget!</span>
        </div>
      )}

      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={7} columns={3} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Weekly Operating Schedule */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Weekly Operating Schedule (IST)
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Set opening and closing times for each day of the week.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shifts.map((s) => (
                <div
                  key={s.day_of_week}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: s.is_active ? '#f8fafc' : '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    opacity: s.is_active ? 1 : 0.65
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '180px' }}>
                    <input
                      type="checkbox"
                      checked={s.is_active}
                      onChange={() => handleToggleDay(s.day_of_week)}
                      style={{ accentColor: '#083e47', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                      {s.name}
                    </span>
                  </div>

                  {s.is_active ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                      <input
                        type="time"
                        value={s.start_time.slice(0, 5)}
                        onChange={(e) => handleTimeChange(s.day_of_week, 'start_time', e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                      />
                      <span style={{ color: '#64748b' }}>to</span>
                      <input
                        type="time"
                        value={s.end_time.slice(0, 5)}
                        onChange={(e) => handleTimeChange(s.day_of_week, 'end_time', e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                      />
                      <span style={{ color: '#083e47', fontSize: '12px', fontWeight: 600 }}>IST</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                      Closed / Not Operating
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Mid-Day Lunch & Break Windows */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coffee size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Mid-Day Lunch & Break Windows
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '16px' }}>
              Prevent automated client bookings during lunch hours (e.g. 13:00 - 14:00 IST) across all practitioner schedules.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '8px', background: '#f0fdfa', border: '1px solid #ccfbf1', color: '#0f766e', fontSize: '13.5px', fontWeight: 600 }}>
              <Clock size={16} />
              <span>Default Staff Break: 13:00 - 14:00 IST (Active across all schedules)</span>
            </div>
          </div>

          {/* Section 3: National & Festive Holidays */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                National & Festive Holidays
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
              Store closures on Republic Day, Diwali, and custom merchant blackout dates automatically block slot holds.
            </p>
          </div>

          {/* Bottom Save Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#083e47',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)'
              }}
            >
              {isSaving ? 'Saving Changes...' : 'Save Working Hours'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingHoursPage;
