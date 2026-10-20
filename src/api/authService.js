import { httpClient } from './httpClient';

export const authService = {
  async register({ name, email, password }) {
    const { data } = await httpClient.post('/auth/register', { name, email, password });
    return data; // { token, user }
  },
  async login({ email, password }) {
    const { data } = await httpClient.post('/auth/login', { email, password });
    return data; // { token, user }
  },
  async me() {
    const { data } = await httpClient.get('/auth/me');
    return data.user;
  },
};
