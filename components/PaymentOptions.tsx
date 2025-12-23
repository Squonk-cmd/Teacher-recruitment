
import React, { useState } from 'react';
import { Applicant } from '../types';
import { APP_CONFIG } from '../constants';
import { ExternalLink, CheckCircle2, FileText, Download, Wallet } from 'lucide-react';
import { generateAdmitCardPDF } from '../services/AdmitCardGenerator';

interface PaymentOptionsProps {
  applicant: Applicant;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ applicant }) => {
  const [paymentDone, setPaymentDone] = useState(false);

  // Determine fee based on position
  const fee = APP_CONFIG.fees[applicant.applyFor as keyof typeof APP_CONFIG.fees] || 0;

  const handlePaymentClick = () => {
    // Open payment link in new window
    window.open(APP_CONFIG.paymentLink, '_blank');
    // For demo purposes, we'll allow showing the "Download" button after a few seconds
    setTimeout(() => {
      setPaymentDone(true);
    }, 2000);
  };

  const handleDownloadAdmitCard = () => {
    generateAdmitCardPDF(applicant);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100">
        {!paymentDone ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Application Fee</h1>
            <p className="text-gray-500 mb-8 leading-relaxed font-medium">
              To complete your registration for the <span className="text-brand font-bold">{applicant.applyFor}</span> position, please proceed with the payment.
            </p>
            
            <div className="bg-gray-50 rounded-[2rem] p-8 mb-8 text-left border border-gray-100 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Candidate</span>
                <span className="font-bold text-gray-900">{applicant.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Post Applied</span>
                <span className="font-bold text-gray-700">{applicant.applyFor}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-brand text-xs font-black uppercase tracking-widest">Payable Amount</span>
                <span className="text-3xl font-black text-brand">{fee} <span className="text-sm">BDT</span></span>
              </div>
            </div>

            <button 
              onClick={handlePaymentClick}
              className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-brand/20 active:scale-95 group"
            >
              PROCEED TO PAYMENT 
              <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            <p className="mt-4 text-xs text-gray-400 font-bold uppercase tracking-tighter italic">Secure Payment via SSLCommerz / Mobile Banking</p>
          </div>
        ) : (
          <div className="animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Verified!</h1>
            <p className="text-gray-500 mb-8 font-medium">
              Payment received. Your application is now confirmed. You can download your official admit card below.
            </p>

            <button 
              onClick={handleDownloadAdmitCard}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-900/20"
            >
              DOWNLOAD ADMIT CARD <Download className="w-6 h-6" />
            </button>

            <button 
              onClick={() => window.location.hash = ''}
              className="mt-8 text-brand font-black text-sm hover:underline uppercase tracking-widest"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentOptions;
