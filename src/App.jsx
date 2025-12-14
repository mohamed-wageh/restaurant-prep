import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Recipes from './pages/Recipes';
import './App.css';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth <= 1024) {
      setIsOpen(false);
    }
  }, [location]);

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Prep Manager</h1>
          <p className="sidebar-subtitle">Restaurant Management</p>
        </div>
        <nav className="sidebar-nav">
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => window.innerWidth <= 1024 && setIsOpen(false)}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/setup" 
            className={`nav-item ${location.pathname === '/setup' ? 'active' : ''}`}
            onClick={() => window.innerWidth <= 1024 && setIsOpen(false)}
          >
            <span className="nav-icon">⚙️</span>
            <span>Setup</span>
          </Link>
          <Link 
            to="/recipes" 
            className={`nav-item ${location.pathname === '/recipes' ? 'active' : ''}`}
            onClick={() => window.innerWidth <= 1024 && setIsOpen(false)}
          >
            <span className="nav-icon">📋</span>
            <span>Recipes</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/recipes" element={<Recipes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

