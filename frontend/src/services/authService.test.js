import axios from 'axios';
import AuthServices from './authService';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('AuthServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts registration requests to the Django register endpoint', async () => {
    axios.post.mockResolvedValue({ data: {} });

    await AuthServices.register({
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirm_password: 'password123',
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/auth/register',
      expect.any(Object),
      expect.objectContaining({ headers: expect.any(Object), timeout: 15000 })
    );
  });

  it('posts login requests to the Django login endpoint', async () => {
    axios.post.mockResolvedValue({ data: {} });

    await AuthServices.login({ email: 'test@example.com', password: 'password123' });

    expect(axios.post).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/auth/login',
      expect.any(Object),
      expect.objectContaining({ headers: expect.any(Object), timeout: 15000 })
    );
  });
});
