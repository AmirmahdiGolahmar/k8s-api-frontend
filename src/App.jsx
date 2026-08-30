import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './components/RequireAuth';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Clusters from './pages/Clusters';
import Namespaces from './pages/Namespaces';
import Apps from './pages/Apps';
import Backups from './pages/Backups';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/clusters" element={<Clusters />} />
            <Route path="/namespaces" element={<Namespaces />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/backups" element={<Backups />} />
            <Route path="/" element={<Navigate to="/clusters" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
