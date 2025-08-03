import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token } = data;
      localStorage.setItem('jwt', token);
      setAuthToken(token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <label className="block mb-4">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-200"
          />
        </label>
        <label className="block mb-6">
          <span className="text-gray-700">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-200"
          />
        </label>
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Login
        </button>
        
      </form>
    </div>
  );
}
