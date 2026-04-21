const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(path, token, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || `API error ${res.status}`);
  }
  return json;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export const getDashboard = (token, date) =>
  request(`/admin/dashboard?date=${date}`, token);

// ── Clinics ────────────────────────────────────────────────────────────────────
export const getClinics = (token) =>
  request('/admin/clinics', token);

// ── Schedule ───────────────────────────────────────────────────────────────────
export const getSchedule = (token, { dateFrom, dateTo, clinicId } = {}) => {
  const params = new URLSearchParams({ dateFrom, dateTo });
  if (clinicId) params.set('clinicId', clinicId);
  return request(`/admin/schedule?${params}`, token);
};

// ── Bookings (Pending / History) ───────────────────────────────────────────────
export const getBookings = (token, { clinicId, status, dateFrom, dateTo, patientPhone, limit, lastId } = {}) => {
  const params = new URLSearchParams();
  if (clinicId) params.set('clinicId', clinicId);
  if (status) params.set('status', status);
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  if (patientPhone) params.set('patientPhone', patientPhone);
  if (limit) params.set('limit', limit);
  if (lastId) params.set('lastId', lastId);
  return request(`/admin/bookings?${params}`, token);
};

export const createBooking = (token, body) =>
  request('/admin/bookings', token, { method: 'POST', body });

export const updateBooking = (token, body) =>
  request('/admin/bookings', token, { method: 'PATCH', body });

export const deleteBooking = (token, appointmentId) =>
  request(`/admin/bookings?appointmentId=${appointmentId}`, token, { method: 'DELETE' });

// ── Leaves ─────────────────────────────────────────────────────────────────────
export const getLeaves = (token, { clinicId, scope } = {}) => {
  const params = new URLSearchParams();
  if (clinicId) params.set('clinicId', clinicId);
  if (scope) params.set('scope', scope);
  return request(`/admin/leaves?${params}`, token);
};

export const createLeave = (token, body) =>
  request('/admin/leaves', token, { method: 'POST', body });

export const deleteLeave = (token, id) =>
  request(`/admin/leaves?id=${id}`, token, { method: 'DELETE' });

// ── Slots ──────────────────────────────────────────────────────────────────────
export const getSlots = (token, { date, clinicId } = {}) => {
  const params = new URLSearchParams({ date });
  if (clinicId) params.set('clinicId', clinicId);
  return request(`/admin/slots?${params}`, token);
};

export const manageSlot = (token, body) =>
  request('/admin/slots', token, { method: 'POST', body });
