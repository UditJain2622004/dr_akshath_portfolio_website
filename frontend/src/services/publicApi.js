const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || `API error ${res.status}`);
  return json;
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || `API error ${res.status}`);
  return json;
}

export const getClinics = () => get('/clinics');

export const getSlotsByClinic = (date, clinicId) =>
  get(`/slots?date=${date}&clinicId=${clinicId}`);

export const getSlotsByTime = (date, time) =>
  get(`/slots?date=${date}&time=${time}`);

export const bookAppointment = (body) => post('/appointments', body);
