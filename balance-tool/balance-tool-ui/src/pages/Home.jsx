// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

function ChartRenderer({ data }) {
  try {
    const parsed = JSON.parse(data);
    const { type, labels, datasets } = parsed;
    const config = { labels, datasets };

    switch (type) {
      case 'bar': return <Bar data={config} />;
      case 'line': return <Line data={config} />;
      case 'pie': return <Pie data={config} />;
      default: return <pre className="text-red-500">Unsupported chart type</pre>;
    }
  } catch {
    return <pre className="text-red-500">Invalid chart data</pre>;
  }
}

export default function Home() {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [responseType, setResponseType] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  async function fetchHistory() {
    try {
      const { data } = await api.get('/chat/history');
      setHistory(data.history || []);
    } catch (err) {
      setHistory([]);
    }
  }

  async function handleAsk() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const { data } = await api.post('/chat', { question });
      setAnswer(data.answer);
      setResponseType(data.responseType);
      setQuestion('');
      fetchHistory();
    } catch (err) {
      setAnswer('Error: ' + (err.response?.data?.error || 'Unable to fetch answer'));
      setResponseType('text');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('PDF uploaded and parsed: ' + JSON.stringify(data.data));
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.error || 'Unknown error'));
    }
  }

  useEffect(() => {
    fetchHistory();
    setShowHistory(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4">
      <div className="flex-grow w-full bg-white p-6 rounded-lg shadow-lg flex flex-col">
        <div className="pb-4 mb-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Balance Sheet Tool</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="mt-2 sm:mt-0 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-indigo-600 underline text-sm"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="overflow-y-auto bg-gray-50 rounded p-4 mb-4 max-h-64 border">
            {history.length === 0 ? (
              <p className="text-gray-400">No analysis yet.</p>
            ) : (
              history.map((chat) => (
                <div key={chat.id} className="mb-2 last:mb-0">
                  <p className="font-semibold text-indigo-700">Q: {chat.question}</p>
                  {chat.response_type === 'chart' ? (
                    <ChartRenderer data={chat.answer} />
                  ) : (
                    <p className="text-gray-800 mt-1">A: {chat.answer}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex-grow overflow-y-auto space-y-4 pr-2">
          {answer ? (
            <div className="bg-blue-50 p-3 rounded-lg shadow">
              <strong>Response:</strong>
              {responseType === 'chart' ? (
                <ChartRenderer data={answer} />
              ) : (
                <p>{answer}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-8">Ask a question to get started!</p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAsk}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
