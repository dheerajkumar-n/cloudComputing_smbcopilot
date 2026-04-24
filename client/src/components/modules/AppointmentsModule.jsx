import React, { useState, useEffect } from 'react';
import { staffAPI } from '../../services/api';

function AddAppointmentModal({ businessId, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    customerName: '', service: '', date: today, startTime: '09:00', endTime: '10:00',
    employeeName: '', notes: '', type: 'appointment', status: 'scheduled'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await staffAPI.createShift(businessId, form);
      onSave();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-modal-overlay">
      <div className="form-modal">
        <h3>📅 Book Appointment</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input className="form-input" required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div className="form-group">
              <label>Service</label>
              <input className="form-input" required value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="Haircut & Color" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input className="form-input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Staff Member</label>
              <input className="form-input" value={form.employeeName} onChange={e => setForm({ ...form, employeeName: e.target.value })} placeholder="Stylist name" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input className="form-input" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input className="form-input" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Booking...' : 'Book Appointment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  scheduled: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
  'no-show': 'badge-yellow'
};

export default function AppointmentsModule({ businessId }) {
  const [appointments, setAppointments] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState('upcoming');

  const load = async () => {
    try {
      const [appts, shifts] = await Promise.all([
        staffAPI.getAppointments(businessId),
        staffAPI.getShifts(businessId, { type: 'appointment' })
      ]);
      setAppointments(appts);
      setAllShifts(shifts);
    } catch {
      setAppointments([]);
      setAllShifts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [businessId]);

  const updateStatus = async (id, status) => {
    try {
      await staffAPI.updateShift(id, { status });
      load();
    } catch {}
  };

  const displayed = view === 'upcoming' ? appointments : allShifts;
  const todayCount = appointments.filter(a => {
    const d = new Date(a.date);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  }).length;

  return (
    <div className="module-page">
      {showAdd && <AddAppointmentModal businessId={businessId} onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}

      <div className="module-header">
        <div className="module-header-left">
          <h2>📅 Appointments</h2>
          <p>{todayCount} today · {appointments.length} upcoming this week</p>
        </div>
        <div className="btn-group">
          <button className={`btn btn-sm ${view === 'upcoming' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('upcoming')}>This Week</button>
          <button className={`btn btn-sm ${view === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('all')}>All</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Book</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Appointment Schedule</span>
          <span style={{ fontSize: 12, color: '#718096' }}>{displayed.length} appointments</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : displayed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Staff</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {displayed.map(appt => (
                  <tr key={appt._id}>
                    <td style={{ fontWeight: 600 }}>{appt.customerName || '—'}</td>
                    <td>{appt.service || '—'}</td>
                    <td>{new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}</td>
                    <td>{appt.startTime} – {appt.endTime}</td>
                    <td>{appt.employeeName || '—'}</td>
                    <td><span className={`badge ${STATUS_BADGE[appt.status] || 'badge-gray'}`}>{appt.status}</span></td>
                    <td>
                      {appt.status === 'scheduled' && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-sm btn-success" onClick={() => updateStatus(appt._id, 'completed')}>✓</button>
                          <button className="btn btn-sm btn-danger" onClick={() => updateStatus(appt._id, 'cancelled')}>✕</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
