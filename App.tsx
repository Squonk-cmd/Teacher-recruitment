
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ApplicationForm from './components/ApplicationForm';
import AdminPanel from './components/AdminPanel';
import PaymentOptions from './components/PaymentOptions';
import { Applicant } from './types';

type View = 'home' | 'application' | 'payment' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [currentApplicant, setCurrentApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      // Control scrolling
      document.body.style.overflow = (hash === '' || hash === 'home') ? 'hidden' : 'auto';

      if (hash === 'admin') setCurrentView('admin');
      else if (hash === 'application') setCurrentView('application');
      // CRITICAL: Ensure we don't lose the applicant on refresh if using hash routing
      else if (hash === 'payment') {
        if (currentApplicant) {
          setCurrentView('payment');
        } else {
          // If user refreshes on payment page without state, send them back
          window.location.hash = 'application';
        }
      }
      else setCurrentView('home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentApplicant]);

  const handleApplyClick = () => {
    window.location.hash = 'application';
  };

  // 1. The Submit Handler: Just update the state
const handleFormSubmit = (dataFromDb: any) => {
  // Map snake_case to camelCase immediately
  const formatted = {
    ...dataFromDb,
    id: dataFromDb.id,
    applyFor: dataFromDb.apply_for || dataFromDb.applyFor,
    selectedSubject: dataFromDb.selected_subject || dataFromDb.selectedSubject,
    paymentStatus: dataFromDb.payment_status || dataFromDb.paymentStatus,
  };

  console.log("Setting Applicant state...", formatted);
  setCurrentApplicant(formatted);
  // DO NOT set window.location.hash here.
};

// 2. The Navigation Effect: Watch for the state change
useEffect(() => {
  // If we have an applicant and we are currently on the application page,
  // it means a successful submission just happened.
  if (currentApplicant && currentView === 'application') {
    console.log("Applicant state ready. Navigating to payment...");
    setCurrentView('payment');
    window.location.hash = 'payment';
  }
}, [currentApplicant, currentView]);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'home' && <Home onApply={handleApplyClick} />}
      {currentView === 'application' && <ApplicationForm onSubmit={handleFormSubmit} />}
      {currentView === 'payment' && currentApplicant && (
        <PaymentOptions applicant={currentApplicant} />
      )}
      {currentView === 'admin' && <AdminPanel />}
    </div>
  );
};

export default App;
