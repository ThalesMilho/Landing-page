const BASE = '/api/v1';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const api = {
  // Indicators
  getIndicators:   ()           => request('GET',    '/indicators'),
  createIndicator: (data)       => request('POST',   '/indicators', data),
  updateIndicator: (id, data)   => request('PUT',    `/indicators/${id}`, data),
  deleteIndicator: (id)         => request('DELETE', `/indicators/${id}`),

  // Settings
  getSetting: (key)        => request('GET', `/settings/${key}`),
  putSetting: (key, value) => request('PUT', `/settings/${key}`, { value }),

  // Categories
  getCategories: (module)       => request('GET',    `/categories?module=${module}`),
  createCategory: (data)        => request('POST',   '/categories',       data),
  updateCategory: (id, data)    => request('PUT',    `/categories/${id}`, data),
  deleteCategory: (id)          => request('DELETE', `/categories/${id}`),

  // Documents
  getDocs: (module)     => request('GET', `/documents?module=${module}`),
  uploadDoc: (data)     => request('POST', '/documents', data),
  deleteDoc: (id)       => request('DELETE', `/documents/${id}`),
  downloadDoc: (id)     => request('GET', `/documents/${id}/download`),
  viewDoc: (id)         => request('GET', `/documents/${id}/view`)
};