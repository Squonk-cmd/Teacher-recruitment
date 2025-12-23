
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

  // This 'applicant' now comes from the database response (via ApplicationForm)
  const handleFormSubmit = (applicant: Applicant) => {
    console.log("Applicant saved to DB:", applicant);
    setCurrentApplicant(applicant); 
    window.location.hash = 'payment';
  };

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
