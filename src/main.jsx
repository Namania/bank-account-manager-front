import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/ThemeProvider"
import './index.css'
import "./i18n";

import Accounts from './pages/Accounts.jsx'
import Layout from './components/Layout'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
import { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Category from './pages/Categories';
import { Toaster } from './components/ui/sonner';
import Transaction from './pages/Transaction';
import Account from './pages/Account';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Recurring from './pages/Recurring';
import Budgets from './pages/Budgets';
import { getHealth, setMaintenanceHandler } from './api/client';

const MAINTENANCE_POLL_MS = 30_000;

export default function Root() {
  const [maintenance, setMaintenance] = useState(null);
  const localKey = import.meta.env.VITE_LOCAL_KEY;
  const { i18n } = useTranslation();

  const defaultTheme = localStorage.getItem(`${localKey}.theme`) ?? 'dark';
  const storedLang = localStorage.getItem(`${localKey}.lang`);
  const defaultLang = ['fr', 'en'].includes(storedLang) ? storedLang : 'fr';

  useEffect(() => {
    i18n.changeLanguage(defaultLang);
  }, [defaultLang, i18n]);

  // Maintenance is decided by the API: asked once at start, and reported by
  // any request that comes back 503 while the app is in use.
  useEffect(() => {
    setMaintenanceHandler((message) => setMaintenance({ enabled: true, message }));
    getHealth()
      .then((health) => setMaintenance({ enabled: health.maintenance, message: health.message }))
      .catch(() => setMaintenance((current) => current ?? { enabled: false, message: '' }));
    return () => setMaintenanceHandler(() => {});
  }, []);

  // While in maintenance, ask again regularly and start afresh once it is over.
  const inMaintenance = maintenance?.enabled === true;
  useEffect(() => {
    if (!inMaintenance) return;
    const timer = setInterval(() => {
      getHealth()
        .then((health) => { if (!health.maintenance) window.location.reload(); })
        .catch(() => {});
    }, MAINTENANCE_POLL_MS);
    return () => clearInterval(timer);
  }, [inMaintenance]);

  if (maintenance === null) return null;

  if (inMaintenance) {
    return (
      <ThemeProvider defaultTheme={ defaultTheme }>
        <Maintenance message={maintenance.message} />
      </ThemeProvider>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme={ defaultTheme }>
        <BrowserRouter>
          <Routes>

            <Route path="/auth/login" element={<LoginPage />} />

            <Route element={<LayoutWrapper />}>
              <Route path="/" element={<Accounts />} />
              <Route path="/account/:id" element={<Account />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/category" element={<Category />} />
              <Route path="/recurring" element={<Recurring />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>

          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
    </AuthProvider>
  );
}

function LayoutWrapper() {
  const { isLogged, loading } = useAuth();

  if (loading) return null;
  if (!isLogged) {
    return <Navigate to="/auth/login" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

createRoot(document.getElementById('root')).render(<Root />)
