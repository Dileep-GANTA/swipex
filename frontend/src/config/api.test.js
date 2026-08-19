import { buildApiUrl, getApiHeaders } from './api';

describe('API config helpers', () => {
  it('builds a relative backend URL by default for the dev proxy', () => {
    expect(buildApiUrl('/api/auth/login')).toBe('/api/auth/login');
  });

  it('adds the authorization header when a token is provided', () => {
    expect(getApiHeaders('abc123')).toEqual(expect.objectContaining({
      Authorization: 'Bearer abc123',
    }));
  });
});
