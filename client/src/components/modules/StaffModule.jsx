import React, { useState, useEffect, useCallback } from 'react';
import { staffAPI } from '../../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ShiftOptionsModal({ shift, onClose, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(shift.startTime || '09:00');
  const [end, setEnd] = useState(shift.endTime || '17:00');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onEdit(shift._id, { startTime: start, endTime: end });
    setSaving(false);
    onClose();
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <h3>📅 Shift Details</h3>
        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{shift.employeeName}</div>
          <div style={{ fontSize: 13, color: '#718096' }}>
            {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          {!editing && (
            <div style={{ fontSize: 14, marginTop: 6, color: '#4A5568', fontWeight: 600 }}>
              🕐 {shift.startTime} – {shift.endTime}
            </div>
          )}
        </div>

        {editing ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input className="form-input" type="time" value={start} onChange={e => setStart(e.target.value)} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input className="form-input" type="time" value={end} onChange={e => setEnd(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => setEditing(true)}>
              ✏️ Edit Shift Times
            </button>
            <button className="btn btn-danger" style={{ justifyContent: 'center' }} onClick={() => onDelete(shift._id)}>
              🗑️ Remove This Shift
            </button>
            <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AddShiftModal({ employee, date, businessId, onSave, onClose }) {
  const [form, setForm] = useState({ startTime: '09:00', endTime: '17:00' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await staffAPI.createShift(businessId, {
        employeeId: employee._id, employeeName: employee.name,
        date: date.toISOString(), startTime: form.startTime, endTime: form.endTime,
        role: employee.role, type: 'shift', status: 'scheduled'
      });
      onSave();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <h3>➕ Add Shift</h3>
        <div style={{ background: '#F7FAFC', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>{employee.name}</div>
          <div style={{ fontSize: 13, color: '#718096' }}>
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Shift'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddEmployeeModal({ businessId, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', hourlyRate: 15 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await staffAPI.createEmployee(businessId, { ...form, hourlyRate: Number(form.hourlyRate) });
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
        <h3>👤 Add Team Member</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Cashier" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Hourly Rate ($)</label>
              <input className="form-input" type="number" min="0" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Employee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffModule({ businessId }) {
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('schedule');
  const [weekStart, setWeekStart] = useState(getMondayOfWeek(new Date()));
  const [selectedShift, setSelectedShift] = useState(null);
  const [addShiftTarget, setAddShiftTarget] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const loadShifts = useCallback(async () => {
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    try {
      const data = await staffAPI.getShifts(businessId, {
        type: 'shift',
        startDate: weekStart.toISOString(),
        endDate: endDate.toISOString()
      });
      setShifts(data);
    } catch {
      setShifts([]);
    }
  }, [businessId, weekStart]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const emps = await staffAPI.getEmployees(businessId);
      setEmployees(emps);
    } catch {
      setEmployees([]);
    }
    await loadShifts();
    setLoading(false);
  }, [businessId, loadShifts]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { loadShifts(); }, [loadShifts]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getMondayOfWeek(new Date()));

  const getShiftsForCell = (empId, dateObj) =>
    shifts.filter(s => {
      const sd = new Date(s.date);
      return String(s.employeeId) === String(empId) &&
        sd.getDate() === dateObj.getDate() &&
        sd.getMonth() === dateObj.getMonth() &&
        sd.getFullYear() === dateObj.getFullYear();
    });

  const handleDeleteShift = async (shiftId) => {
    try {
      await staffAPI.updateShift(shiftId, { status: 'cancelled' });
      setSelectedShift(null);
      loadShifts();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleEditShift = async (shiftId, data) => {
    try {
      await staffAPI.updateShift(shiftId, data);
      loadShifts();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeactivate = async (empId) => {
    if (!window.confirm('Remove this employee from active staff?')) return;
    try {
      await staffAPI.updateEmployee(empId, { status: 'inactive' });
      loadAll();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const isToday = (date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const weekLabel = `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const totalShifts = shifts.filter(s => s.status !== 'cancelled').length;

  const statusColors = { active: 'badge-green', inactive: 'badge-gray', 'on-leave': 'badge-yellow' };

  return (
    <div className="module-page">
      {selectedShift && (
        <ShiftOptionsModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
          onDelete={handleDeleteShift}
          onEdit={handleEditShift}
        />
      )}
      {addShiftTarget && (
        <AddShiftModal
          employee={addShiftTarget.employee}
          date={addShiftTarget.date}
          businessId={businessId}
          onSave={() => { setAddShiftTarget(null); loadShifts(); }}
          onClose={() => setAddShiftTarget(null)}
        />
      )}
      {showAddEmployee && (
        <AddEmployeeModal
          businessId={businessId}
          onSave={() => { setShowAddEmployee(false); loadAll(); }}
          onClose={() => setShowAddEmployee(false)}
        />
      )}

      <div className="module-header">
        <div className="module-header-left">
          <h2>👥 Staff Management</h2>
          <p>{employees.filter(e => e.status === 'active').length} active · {totalShifts} shifts this week</p>
        </div>
        <div className="btn-group">
          <button className={`btn btn-sm ${view === 'schedule' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('schedule')}>📅 Schedule</button>
          <button className={`btn btn-sm ${view === 'team' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('team')}>👤 Team</button>
          <button className="btn btn-primary" onClick={() => setShowAddEmployee(true)}>+ Add Employee</button>
        </div>
      </div>

      {view === 'schedule' ? (
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn btn-outline btn-sm" onClick={prevWeek}>← Prev</button>
              <button className="btn btn-outline btn-sm" onClick={goToday}>Today</button>
              <button className="btn btn-outline btn-sm" onClick={nextWeek}>Next →</button>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4A5568' }}>{weekLabel}</span>
            </div>
            <span style={{ fontSize: 12, color: '#A0AEC0' }}>Click a shift to edit · Click empty cell to add</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : employees.filter(e => e.status === 'active').length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">👥</div><p>No active employees. Add staff first.</p></div>
            ) : (
              <table className="data-table" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 120 }}>Employee</th>
                    {weekDates.map((d, i) => (
                      <th key={i} style={{ textAlign: 'center', background: isToday(d) ? '#EBF4FF' : undefined, minWidth: 90 }}>
                        <div>{DAYS[i]}</div>
                        <div style={{ fontWeight: 400, fontSize: 11, color: isToday(d) ? '#667eea' : '#A0AEC0' }}>{d.getDate()}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <tr key={emp._id}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EBF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#667eea', fontSize: 12, flexShrink: 0 }}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div>{emp.name}</div>
                            <div style={{ fontSize: 11, color: '#A0AEC0', fontWeight: 400 }}>{emp.role}</div>
                          </div>
                        </div>
                      </td>
                      {weekDates.map((d, di) => {
                        const cellShifts = getShiftsForCell(emp._id, d).filter(s => s.status !== 'cancelled');
                        return (
                          <td key={di} style={{ padding: '6px 8px', background: isToday(d) ? '#F7FBFF' : undefined, cursor: 'pointer', verticalAlign: 'top' }}
                            onClick={() => !cellShifts.length && setAddShiftTarget({ employee: emp, date: d })}>
                            {cellShifts.length > 0 ? (
                              cellShifts.map(s => (
                                <div key={s._id}
                                  onClick={e => { e.stopPropagation(); setSelectedShift(s); }}
                                  style={{ background: '#EBF4FF', border: '1px solid #90CDF4', borderLeft: '3px solid #667eea', borderRadius: 4, padding: '4px 6px', fontSize: 11, color: '#2C5282', cursor: 'pointer', marginBottom: 2 }}>
                                  <div style={{ fontWeight: 700 }}>{s.startTime}–{s.endTime}</div>
                                </div>
                              ))
                            ) : (
                              <div style={{ height: 32, border: '1px dashed #E2E8F0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E0', fontSize: 16 }}>+</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #F7FAFC', fontSize: 12, color: '#A0AEC0' }}>
            💡 Tip: Use AI chat — "Add John on Monday shift from 9am to 5pm"
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Team Members</span>
            <span style={{ fontSize: 12, color: '#718096' }}>{employees.filter(e => e.status === 'active').length} active</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : employees.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">👥</div><p>No employees yet</p></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Role</th><th>Contact</th><th>Rate</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: emp.status === 'active' ? '#EBF4FF' : '#EDF2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: emp.status === 'active' ? '#667eea' : '#A0AEC0' }}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{emp.name}</div>
                            {emp.email && <div style={{ fontSize: 11, color: '#718096' }}>{emp.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td>{emp.role || '—'}</td>
                      <td>{emp.phone || '—'}</td>
                      <td>${emp.hourlyRate}/hr</td>
                      <td><span className={`badge ${statusColors[emp.status] || 'badge-gray'}`}>{emp.status}</span></td>
                      <td>
                        {emp.status === 'active' ? (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(emp._id)}>Remove</button>
                        ) : (
                          <button className="btn btn-sm btn-success" onClick={async () => { await staffAPI.updateEmployee(emp._id, { status: 'active' }); loadAll(); }}>Reactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #F7FAFC', fontSize: 12, color: '#A0AEC0' }}>
            💡 AI chat: "Add Sarah as Cashier" · "Remove John"
          </div>
        </div>
      )}
    </div>
  );
}
