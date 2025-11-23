import React, { useState, useEffect } from 'react';

function formatISO(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCalendar(month, year) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days = [];
  const startDay = first.getDay(); // 0-6 Sun-Sat
  // pad previous month
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

export default function DatePicker({ name, value, onChange, placeholder = 'Date of Birth', inputClassName = '' }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value ? new Date(value) : null);
  const [viewMonth, setViewMonth] = useState((selected || new Date()).getMonth());
  const [viewYear, setViewYear] = useState((selected || new Date()).getFullYear());

  useEffect(() => {
    setSelected(value ? new Date(value) : null);
  }, [value]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest) return;
      // close if click outside component
      if (!e.target.closest('.date-picker-root')) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const days = buildCalendar(viewMonth, viewYear);
  const weekdays = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  const selectDate = (d) => {
    if (!d) return;
    setSelected(d);
    setOpen(false);
    const iso = formatISO(d);
    onChange && onChange(iso);
  };

  // build year options (quick jump). For DOB, show a reasonable range: currentYear down to currentYear - 100
  const now = new Date();
  const currentYear = now.getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 100; y--) years.push(y);
  const months = Array.from({ length: 12 }).map((_, i) => new Date(0, i).toLocaleString(undefined, { month: 'short' }));

  return (
    <div className="date-picker-root" style={{ position: 'relative' }}>
      <input
        readOnly
        name={name}
        value={selected ? formatISO(selected) : ''}
        placeholder={placeholder}
        onClick={() => setOpen(!open)}
        className={`form-input ${inputClassName}`.trim()}
        style={{ cursor: 'pointer' }}
      />

      {open && (
        <div style={{ position: 'absolute', zIndex: 60, top: '100%', left: 0, marginTop: 8, background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.6)', minWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => { setViewMonth(m => { if (m === 0) { setViewYear(y=>y-1); return 11; } return m-1; }); }} className="px-2 rounded" style={{ background: 'transparent', border: '1px solid #222', color: '#e5e7eb' }}>{'<'}</button>
              <button type="button" onClick={() => { setViewMonth(m => { if (m === 11) { setViewYear(y=>y+1); return 0; } return m+1; }); }} className="px-2 rounded" style={{ background: 'transparent', border: '1px solid #222', color: '#e5e7eb' }}>{'>'}</button>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select aria-label="Month" value={viewMonth} onChange={(e) => setViewMonth(Number(e.target.value))} style={{ background: 'transparent', border: '1px solid #222', color: '#e5e7eb', padding: '6px 8px', borderRadius: 6 }}>
                {months.map((m, i) => (
                  <option key={m} value={i} style={{ background: '#1a1a1a', color: '#e5e7eb' }}>{m}</option>
                ))}
              </select>

              <select aria-label="Year" value={viewYear} onChange={(e) => setViewYear(Number(e.target.value))} style={{ background: 'transparent', border: '1px solid #222', color: '#e5e7eb', padding: '6px 8px', borderRadius: 6 }}>
                {years.map(y => (
                  <option key={y} value={y} style={{ background: '#1a1a1a', color: '#e5e7eb' }}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <button type="button" onClick={() => { setSelected(null); onChange && onChange(''); setOpen(false); }} className="px-2 rounded" style={{ background: 'transparent', border: '1px solid #222', color: '#e5e7eb' }}>Clear</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
            {weekdays.map(w => (
              <div key={w} style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>{w}</div>
            ))}
            {days.map((d, i) => (
              <div key={i} style={{ height: 34 }}>
                {d ? (
                  <button type="button" onClick={() => selectDate(d)} style={{ width: '100%', height: '100%', borderRadius: 6, border: 'none', background: (selected && d.toDateString() === (selected && selected.toDateString())) ? '#0A3622' : 'transparent', color: (selected && d.toDateString() === (selected && selected.toDateString())) ? '#fff' : '#e5e7eb' }}>
                    {d.getDate()}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
