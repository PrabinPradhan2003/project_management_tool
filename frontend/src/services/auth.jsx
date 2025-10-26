import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  const { token, user } = res.data;
  localStorage.setItem('pm_token', token);
  localStorage.setItem('pm_user', JSON.stringify(user));
  return user;
}

export async function register(name, email, password, role = 'Developer') {
  const res = await api.post('/auth/register', { name, email, password, role });
  return res.data;
}

export function logout() {
  localStorage.removeItem('pm_token');
  localStorage.removeItem('pm_user');
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('pm_user')) || null;
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('pm_token');
}
