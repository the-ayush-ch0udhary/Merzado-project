import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { RfqModal } from './components/RfqModal';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { RfqDetailPage } from './pages/RfqDetailPage';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SupplierDashboard } from './pages/SupplierDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--secondary-500)' }}>
        Authenticating...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/marketplace" replace />;
  }

  return children;
};

const AppContent = () => {
  const [isCreateRfqOpen, setIsCreateRfqOpen] = useState(false);

  const handleRfqSaved = (newRfq) => {
    window.location.reload();
  };

  return (
    <>
      <Navbar onOpenCreateRfq={() => setIsCreateRfqOpen(true)} />

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route
            path="/marketplace"
            element={<MarketplacePage onOpenCreateRfq={() => setIsCreateRfqOpen(true)} />}
          />
          <Route path="/rfq/:id" element={<RfqDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Buyer Only Route */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute requiredRole="BUYER">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Supplier Only Route */}
          <Route
            path="/supplier/submissions"
            element={
              <ProtectedRoute requiredRole="SUPPLIER">
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all redirect to marketplace */}
          <Route path="*" element={<Navigate to="/marketplace" replace />} />
        </Routes>
      </main>

      {/* Global RFQ Creation Modal */}
      <RfqModal
        isOpen={isCreateRfqOpen}
        onClose={() => setIsCreateRfqOpen(false)}
        onRfqSaved={handleRfqSaved}
      />
    </>
  );
};

import { ThemeProvider } from './context/ThemeContext';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
