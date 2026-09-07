import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/feedback/Toast';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import TopProgressBar from './components/layout/TopProgressBar';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <TopProgressBar />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
