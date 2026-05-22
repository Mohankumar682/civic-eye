import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SubmitIssue from './pages/SubmitIssue';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/submit" element={user && user.role !== 'admin' ? <SubmitIssue /> : <Home />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Home />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
