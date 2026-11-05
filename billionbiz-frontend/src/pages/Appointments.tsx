import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  RefreshCw, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { api } from '../api/services';
import { CalendarSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';


const localDateInZone = (value: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(value);
  const values: Record<string, string> = {};
  for (const part of parts) if (part.type !== 'literal') values[part.type] = part.value;
  return values.year + '-' + values.month + '-' + values.day;
};

const localTimeInZone = (value: string | Date, timeZone: string): { date: string; hour: number; minute: number } => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(value));
  const values: Record<string, string> = {};
  for (const part of parts) if (part.type !== 'literal') values[part.type] = part.value;
  return {
    date: values.year + '-' + values.month + '-' + values.day,
    hour: Number(values.hour),
    minute: Number(values.minute)
  };
};

const offsetForZone = (instant: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, timeZoneName: 'longOffset', hour: '2-digit'
  }).formatToParts(instant);
  const zoneName = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT';
  const match = zoneName.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const offset = (Number(match[2]) * 60 + Number(match[3])) * 60000;
  return match[1] === '+' ? offset : -offset;
};

const utcFromLocal = (date: string, hour: number, minute: number, timeZone: string): Date => {
  const [year, month, day] = date.split('-').map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let instant = localAsUtc;
  for (let index = 0; index < 3; index += 1) {
    instant = localAsUtc - offsetForZone(new Date(instant), timeZone);
  }
  return new Date(instant);
};

const addDateOnly = (date: string, days: number): string => {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days, 12));
  return value.getUTCFullYear() + '-' +
    String(value.getUTCMonth() + 1).padStart(2, '0') + '-' +
    String(value.getUTCDate()).padStart(2, '0');
};

const dateOnlyAsUtcDate = (date: string): Date => new Date(date + 'T12:00:00.000Z');

const formatCurrency = (minor: number) => {
  return '₹' + (minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const AppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'list'>('timeline');

  // Bookings & Catalog State
  const [bookings, setBookings] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  // Selected Date state (YYYY-MM-DD)
  const [storeTimezone, setStoreTimezone] = useState('Asia/Kolkata');
  const [selectedDate, setSelectedDate] = useState(() => localDateInZone(new Date(), 'Asia/Kolkata'));

  // Booking form state
  const [selectedOffering, setSelectedOffering] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotLoadError, setSlotLoadError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Load bookings using the store's timezone, never the browser's timezone.
  const loadAppointmentsData = async () => {
    try {
      setLoading(true);
      const [bookingSettingsRes, offeringsRes, staffRes] = await Promise.all([
        api.getBookingSettings(),
        api.getOfferings(),
        api.getStaff()
      ]);
      const timezone = bookingSettingsRes.settings?.timezone || 'Asia/Kolkata';
      setStoreTimezone(timezone);
      const start = utcFromLocal(selectedDate, 0, 0, timezone);
      const nextDay = utcFromLocal(addDateOnly(selectedDate, 1), 0, 0, timezone);
      const bookingsRes = await api.getBookings({
        from: start.toISOString(),
        to: new Date(nextDay.getTime() - 1).toISOString()
      });
      setBookings(bookingsRes.bookings || []);
      setOfferings(offeringsRes.offerings || []);
      setStaffList(staffRes.staff || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentsData();
  }, [selectedDate]);

  // Load staff-specific availability for the selected offering and store-local date.
  useEffect(() => {
    if (!isBookModalOpen || !selectedOffering || !selectedDate) {
      setAvailableSlots([]);
      setSelectedSlot(null);
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setSlotLoadError(null);
    setSelectedSlot(null);
    api.getAvailability(selectedOffering, selectedDate)
      .then((res) => {
        if (cancelled) return;
        setAvailableSlots((res.slots || []).filter((slot: any) => slot.isAvailable));
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailableSlots([]);
          setSlotLoadError(err.message || 'Could not load appointment availability.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => { cancelled = true; };
  }, [isBookModalOpen, selectedOffering, selectedDate, storeTimezone]);

  // Create a persisted 10-minute slot hold, then consume it in the booking transaction.
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering || !selectedSlot || !clientName.trim()) {
      setBookingError('Choose a service and available staff slot, then enter the client name.');
      return;
    }
    if (!clientEmail.trim() && !clientPhone.trim()) {
      setBookingError('Enter either a client email address or phone number.');
      return;
    }

    let holdToken: string | undefined;
    try {
      setSubmitting(true);
      setBookingError(null);
      const hold = await api.holdSlot({
        offeringId: selectedOffering,
        resourceId: selectedSlot.resourceId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      holdToken = hold.holdToken;

      const result = await api.createBooking({
        offeringId: selectedOffering,
        resourceId: selectedSlot.resourceId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        holdToken,
        customerDetails: {
          firstName: clientName.trim(),
          lastName: '',
          email: clientEmail.trim(),
          phone: clientPhone.trim()
        },
        intakeNotes: intakeNotes.trim()
      });

      holdToken = undefined; // consumed atomically by the booking endpoint
      setBookingSuccess(`Booking ${result.bookingNumber || result.bookingId || 'confirmed'} created successfully.`);
      setIsBookModalOpen(false);
      setSelectedOffering('');
      setSelectedSlot(null);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setIntakeNotes('');
      await loadAppointmentsData();
      window.setTimeout(() => setBookingSuccess(null), 3500);
    } catch (err: any) {
      if (holdToken) {
        try { await api.releaseBookingHold(holdToken); } catch { /* hold expires automatically */ }
      }
      setBookingError(err.message || 'The slot could not be booked. Select another time and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Status updates (Check in, Complete, Cancel)
  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      await loadAppointmentsData();
      setSelectedBooking(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  // Date navigation uses a date-only value anchored at UTC noon to avoid DST/browser shifts.
  const changeDateByDays = (days: number) => setSelectedDate(addDateOnly(selectedDate, days));
  const getWeekDates = () => Array.from({ length: 7 }, (_, index) =>
    dateOnlyAsUtcDate(addDateOnly(selectedDate, index - 3))
  );

  // Generate 09:00 to 19:00 IST timeline slots
  const timelineHours = Array.from({ length: 11 }, (_, i) => 9 + i);

  // Filter bookings for active day
  const selectedDateBookings = bookings.filter((b) => localDateInZone(new Date(b.start_time), storeTimezone) === selectedDate);

  const filteredBookings = bookings;

  const countUpcoming = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
  const countCompleted = bookings.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={26} color="#0d9488" />
            Appointments & Bookings Schedule
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Universal reservation suite in Indian Standard Time (Asia/Kolkata, UTC+5:30) with transactional conflict locks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => loadAppointmentsData()}
            title="Refresh Bookings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
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
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Bookings</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{bookings.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600, textTransform: 'uppercase' }}>Upcoming</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0d9488', marginTop: '6px' }}>{countUpcoming}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>{countCompleted}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Specialists on Duty</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284c7', marginTop: '6px' }}>{staffList.length}</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'timeline' ? 600 : 500,
            color: activeTab === 'timeline' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'timeline' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Timeline Schedule Grid (IST)
        </button>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'list' ? 600 : 500,
            color: activeTab === 'list' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'list' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Bookings Directory ({bookings.length})
        </button>
      </div>

      {bookingSuccess && (
        <div style={{ padding: '12px 18px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          {bookingSuccess}
        </div>
      )}

      {/* VIEW 1: TIMELINE GRID */}
      {activeTab === 'timeline' && (
        <div>
          {/* Horizontally scrollable date selector cards */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => changeDateByDays(-1)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setSelectedDate(localDateInZone(new Date(), storeTimezone))}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #0d9488', background: '#f0fdfa', color: '#0d9488', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Today
            </button>

            {/* Week cards */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1, padding: '4px 0' }}>
              {getWeekDates().map((d) => {
                const dateStr = d.toISOString().slice(0, 10);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === localDateInZone(new Date(), storeTimezone);
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                      background: isSelected ? '#ffffff' : '#f8fafc',
                      color: isSelected ? '#0d9488' : '#334155',
                      minWidth: '76px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 4px rgba(13,148,136,0.1)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: isSelected ? '#0d9488' : '#64748b' }}>
                      {d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0' }}>
                      {d.getUTCDate()}
                    </span>
                    {isToday && (
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0d9488' }} />
                    )}
                  </button>
                );
              })}
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#ffffff' }}
            />

            <button
              onClick={() => changeDateByDays(1)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Timeline Grid */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                  {dateOnlyAsUtcDate(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                </span>
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#64748b' }}>
                  Timezone: {storeTimezone}
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0d9488' }}>
                {selectedDateBookings.length} booking(s) scheduled
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '24px' }}>
                <CalendarSkeleton />
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: '700px', display: 'flex', flexDirection: 'column' }}>
                  {timelineHours.map((hour) => {
                    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                    const hourBookings = selectedDateBookings.filter((b) => {
                      const bHour = localTimeInZone(b.start_time, storeTimezone).hour;
                      return bHour === hour;
                    });

                    return (
                      <div
                        key={hour}
                        style={{
                          display: 'flex',
                          borderBottom: '1px solid #f1f5f9',
                          minHeight: '64px',
                          alignItems: 'stretch'
                        }}
                      >
                        {/* Hour Label */}
                        <div
                          style={{
                            width: '90px',
                            padding: '12px 16px',
                            background: '#fafafa',
                            borderRight: '1px solid #e2e8f0',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#64748b',
                            flexShrink: 0
                          }}
                        >
                          {hourStr}
                        </div>

                        {/* Booking Slot Area */}
                        <div style={{ flex: 1, padding: '8px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {hourBookings.length > 0 ? (
                            hourBookings.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => setSelectedBooking(b)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  padding: '8px 14px',
                                  borderRadius: '8px',
                                  background: b.status === 'CONFIRMED' ? '#f0fdfa' : '#f8fafc',
                                  border: b.status === 'CONFIRMED' ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: b.status === 'CONFIRMED' ? '#0d9488' : '#94a3b8' }} />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                                    {b.first_name ? `${b.first_name} ${b.last_name || ''}` : 'Client'} • {b.offering_name || 'Service'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                                    {new Date(b.start_time).toLocaleTimeString('en-IN', { timeZone: storeTimezone, hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString('en-IN', { timeZone: storeTimezone, hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Available</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: LIST VIEW */}
      {activeTab !== 'timeline' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {filteredBookings.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No bookings recorded yet"
              description="When appointments are scheduled by clients or counter staff, they will list here."
              actionLabel="Create Booking"
              onAction={() => setIsBookModalOpen(true)}
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Client</th>
                  <th style={{ padding: '14px 18px' }}>Service Offering</th>
                  <th style={{ padding: '14px 18px' }}>Date & Time (IST)</th>
                  <th style={{ padding: '14px 18px' }}>Specialist / Room</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => setSelectedBooking(b)}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.first_name || 'Client'} {b.last_name || ''}</div>
                      {b.email && <div style={{ fontSize: '12px', color: '#64748b' }}>{b.email}</div>}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#0d9488', fontWeight: 600 }}>
                      {b.offering_name || 'Service Consultation'}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      {new Date(b.start_time).toLocaleDateString('en-IN', { timeZone: storeTimezone })} at {new Date(b.start_time).toLocaleTimeString('en-IN', { timeZone: storeTimezone, hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      {b.resource_name || 'Assigned Room'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: b.status === 'CONFIRMED' ? '#dcfce7' : b.status === 'COMPLETED' ? '#e0f2fe' : '#fee2e2',
                          color: b.status === 'CONFIRMED' ? '#15803d' : b.status === 'COMPLETED' ? '#0369a1' : '#b91c1c'
                        }}
                      >
                        {b.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Booking Details
              </h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setSelectedBooking(null)} />
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Client:</span>{' '}
                <strong style={{ color: '#0f172a' }}>{selectedBooking.first_name || 'Client'} {selectedBooking.last_name || ''}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Service:</span>{' '}
                <strong style={{ color: '#0d9488' }}>{selectedBooking.offering_name || 'Consultation'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Schedule:</span>{' '}
                <span>{new Date(selectedBooking.start_time).toLocaleString('en-IN', { timeZone: storeTimezone })} ({storeTimezone})</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Status:</span>{' '}
                <strong style={{ color: '#0d9488' }}>{selectedBooking.status}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <button
                onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#b91c1c', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel Booking
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedBooking.status !== 'CHECKED_IN' && selectedBooking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'CHECKED_IN')}
                    style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #0d9488', background: '#f0fdfa', color: '#0d9488', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Check In Client
                  </button>
                )}
                {selectedBooking.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0d9488', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal with double-booking validation */}
      {isBookModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleCreateBooking} style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Book Appointment</h3>
              <X size={20} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsBookModalOpen(false)} />
            </div>

            {bookingError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                {bookingError}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Offering *</label>
              <select
                required
                value={selectedOffering}
                onChange={(e) => setSelectedOffering(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
              >
                <option value="">-- Choose Service --</option>
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.duration_minutes || 45} mins - {formatCurrency(o.price_minor)})
                  </option>
                ))}
              </select>
            </div>

            {selectedOffering && (
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Available Slots for {selectedDate} (IST)
                </label>
                {loadingSlots ? (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                    Checking staff schedules and available resources…
                  </div>
                ) : slotLoadError ? (
                  <div role="alert" style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#b91c1c' }}>
                    {slotLoadError}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                    No available staff slots for this service on {selectedDate}.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {availableSlots.map((s, idx) => {
                      const isSelected = selectedSlot?.startTime === s.startTime && selectedSlot?.resourceId === s.resourceId;
                      return (
                        <button
                          key={s.resourceId + ':' + s.startTime}
                          type="button"
                          onClick={() => setSelectedSlot(s)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                            background: isSelected ? '#f0fdfa' : '#fff',
                            color: isSelected ? '#0d9488' : '#334155',
                            fontSize: '12px',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer'
                          }}
                        >
                          <span style={{ display: 'block' }}>{new Date(s.startTime).toLocaleTimeString('en-IN', { timeZone: storeTimezone, hour: '2-digit', minute: '2-digit' })}</span>
                          <span style={{ display: 'block', fontSize: 10, marginTop: 2, opacity: 0.75 }}>{s.resourceName}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Client Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Client Email</label>
              <input
                type="email"
                placeholder="ramesh@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsBookModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: selectedSlot ? 'pointer' : 'not-allowed',
                  opacity: selectedSlot ? 1 : 0.6
                }}
              >
                {submitting ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
