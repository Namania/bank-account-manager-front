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

export default function Root() {
  const [maintenance, setMaintenance] = useState(null);
  const localKey = import.meta.env.VITE_LOCAL_KEY;
  const { i18n } = useTranslation();

  const defaultTheme = localStorage.getItem(`${localKey}.theme`) ?? 'dark';
  const storedLang = localStorage.getItem(`${localKey}.lang`);
  const defaultLang = ['fr', 'en'].includes(storedLang) ? storedLang : 'fr';

  useEffect(() => {
    i18n.changeLanguage(defaultLang);
    fetch('/maintenance.json')
      .then((res) => res.json())
      .then((data) => {
        setMaintenance(data.enabled);
      })
      .catch(() => {
        setMaintenance(false);
      });
  }, [defaultLang, i18n]);

  if (maintenance === null) return null;

  if (maintenance) {
    return (
      <ThemeProvider defaultTheme={ defaultTheme }>
        <Maintenance />
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
