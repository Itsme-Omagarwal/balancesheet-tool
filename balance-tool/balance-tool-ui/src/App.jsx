import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import History from './pages/History';
import { setAuthToken } from './utils/api';

// Restore token on app start
const token = localStorage.getItem('jwt');
if (token) setAuthToken(token);

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
