// Same-origin API client: relative paths, no CORS ever needed -- in prod the
// Ingress routes /cluster, /app, /namespace, /backup, /auth etc. straight to
// the Django backend on the same host as this app; in dev, vite.config.js
// proxies the same paths so the browser still sees one origin.

let cachedCsrfToken = null;

async function ensureCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  const response = await fetch('/auth/csrf/', { credentials: 'same-origin' });
  const data = await response.json();
  cachedCsrfToken = data.csrfToken;
  return cachedCsrfToken;
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers = {};
  let requestBody;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  // Django's SessionAuthentication only enforces CSRF once a session
  // already exists (login itself doesn't need it), but sending it on every
  // unsafe request is simplest -- one rule, no special-casing login.
  if (method !== 'GET') {
    headers['X-CSRFToken'] = await ensureCsrfToken();
  }

  const response = await fetch(url, {
    method,
    headers,
    body: requestBody,
    credentials: 'same-origin',
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error = new Error((data && data.detail) || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: async (username, password) => {
    const result = await request('/auth/login/', { method: 'POST', body: { username, password } });
    // Django rotates the CSRF token on login (session-fixation mitigation)
    // -- the pre-login token is now stale, force a refetch on next use.
    cachedCsrfToken = null;
    return result;
  },
  register: async (username, password) => {
    // register_view also calls Django's login() on success, same CSRF
    // rotation as the login() method above.
    const result = await request('/auth/register/', { method: 'POST', body: { username, password } });
    cachedCsrfToken = null;
    return result;
  },
  logout: async () => {
    const result = await request('/auth/logout/', { method: 'POST' });
    cachedCsrfToken = null;
    return result;
  },
  me: () => request('/auth/me/'),

  listClusters: () => request('/cluster/'),
  createCluster: (data) => request('/cluster/', { method: 'POST', body: data }),
  deleteCluster: (id) => request(`/cluster/${id}/`, { method: 'DELETE' }),
  // Staff-only: is_accessible / allowed_users (list of user ids).
  updateClusterAccess: (id, data) => request(`/cluster/${id}/`, { method: 'PATCH', body: data }),

  listNamespaces: (clusterId) => request('/namespace/', { params: { cluster_id: clusterId } }),
  createNamespace: (clusterId, name) =>
    request('/namespace/', { method: 'POST', body: { cluster_id: clusterId, name } }),
  deleteNamespace: (id) => request(`/namespace/${id}/`, { method: 'DELETE' }),
  // Staff-only: is_accessible / allowed_user_ids.
  updateNamespaceAccess: (id, data) => request(`/namespace/${id}/`, { method: 'PATCH', body: data }),
  // Staff-only: every namespace that actually exists in the cluster (not
  // just DB-tracked ones) -- kube-system, default, anything created
  // outside this app.
  listLiveNamespaces: (clusterId) => request('/namespace/live/', { params: { cluster_id: clusterId } }),

  listUsers: () => request('/auth/users/'),

  listApps: (clusterId, namespace) => request('/app/', { params: { cluster_id: clusterId, namespace } }),
  createApp: (data) => request('/app/', { method: 'POST', body: data }),
  deleteApp: (id) => request(`/app/${id}/`, { method: 'DELETE' }),
  refreshAppStatus: (id) => request(`/app/${id}/refresh/`, { method: 'POST' }),

  listBackups: (appId) => request('/backup/', { params: { app_id: appId } }),
  createBackup: (data) => request('/backup/', { method: 'POST', body: data }),
  getBackup: (id) => request(`/backup/${id}/`),
};
