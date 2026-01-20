
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import ApplicationForm from './components/ApplicationForm';
import AdminPanel from './components/AdminPanel';
import PaymentOptions from './components/PaymentOptions';
import { Applicant } from './types';
import { ExternalLink, CheckCircle2, FileText, Download, Wallet } from 'lucide-react';
import { generateAdmitCardPDF } from './services/AdmitCardGenerator';

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
      else if (hash === 'payment-success') setCurrentView('payment-success'); // 2. New Route
      else if (hash === 'payment-failure') setCurrentView('payment-failure'); // 3. New Route
      else if (hash === 'payment') {
        if (currentApplicant) {
          setCurrentView('payment');
        } else {
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

 // 1. Save data to localStorage when it arrives from the form
const handleFormSubmit = (dataFromDb: any) => {
  const formatted = {
    ...dataFromDb,
    id: dataFromDb.id,
    applyFor: dataFromDb.apply_for || dataFromDb.applyFor,
    selectedSubject: dataFromDb.selected_subject || dataFromDb.selectedSubject,
    paymentStatus: dataFromDb.payment_status || dataFromDb.paymentStatus,
    // CRITICAL: Ensure photo URL is mapped here
    photo: dataFromDb.photo_url 
      ? `https://ukacollegiate.school/uploads/${dataFromDb.photo_url}` 
      : null
  };

  setCurrentApplicant(formatted);
  // Persist the data so it survives the bKash redirect
  localStorage.setItem('pending_applicant', JSON.stringify(formatted));
};

// 2. Retrieve data when the App loads (especially on payment success)
useEffect(() => {
  const saved = localStorage.getItem('pending_applicant');
  if (saved && !currentApplicant) {
    setCurrentApplicant(JSON.parse(saved));
  }
}, []);

 const handleDownloadAdmitCard = () => {
    generateAdmitCardPDF(currentApplicant);
  };


  const handleGoHome = () => {
  // Clear the temporary storage
  localStorage.removeItem('pending_applicant');
  // Reset the state
  setCurrentApplicant(null);
  // Navigate back to home
  window.location.hash = '';
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
      {/* 4. Render the new Success/Failure views */}
      {currentView === 'payment-success' && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
          <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md border border-emerald-100">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
            <button 
    onClick={handleDownloadAdmitCard} 
    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-900/20"
  >
    DOWNLOAD ADMIT CARD <Download className="w-6 h-6" />
  </button>

  <button 
    onClick={handleGoHome} // Use the function here
    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold transition-colors"
  >
    Back to Home
  </button>
          </div>
        </div>
      )}

      {currentView === 'payment-failure' && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
          <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md border border-rose-100">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-8">Something went wrong with your transaction. Please try again or contact support.</p>
            <button onClick={handleGoHome} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold">Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
