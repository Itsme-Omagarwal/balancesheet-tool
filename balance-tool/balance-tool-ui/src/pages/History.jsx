// src/pages/History.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await api.get('/chat/history');
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    }

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button
        onClick={() => navigate('/home')}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Back to Home
      </button>
      <h1 className="text-2xl font-bold mb-6">Chat History</h1>
      <div className="space-y-4">
        {history.length === 0 && <p>No previous chats found.</p>}
        {history.map((entry, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <p><strong>Q:</strong> {entry.question}</p>
            <p><strong>A:</strong> {entry.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
