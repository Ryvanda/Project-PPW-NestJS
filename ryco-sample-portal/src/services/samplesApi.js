const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handleResponse(res) {
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const rawMessage = data?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(' • ')
      : rawMessage || `Permintaan API gagal dengan status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export async function getSamples() {
  const res = await fetch(`${API_BASE_URL}/samples`);
  return handleResponse(res);
}

export async function getSampleById(id) {
  const res = await fetch(`${API_BASE_URL}/samples/${encodeURIComponent(id)}`);
  return handleResponse(res);
}

export async function createSample(payload) {
  const res = await fetch(`${API_BASE_URL}/samples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateSample(id, payload) {
  const res = await fetch(`${API_BASE_URL}/samples/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteSample(id) {
  const res = await fetch(`${API_BASE_URL}/samples/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}

export async function resetSamples() {
  const res = await fetch(`${API_BASE_URL}/samples/reset`, {
    method: 'POST',
  });
  return handleResponse(res);
}
