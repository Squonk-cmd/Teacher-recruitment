
import React, { useState } from 'react';
import { APP_CONFIG } from '../constants';
import { ChevronRight, ClipboardList } from 'lucide-react';

interface HomeProps {
  onApply: () => void;
}

const Home: React.FC<HomeProps> = ({ onApply }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="landing-viewport">
      {/* Main Poster Container (1158x1280 proportional, 100% height) */}
      <div className="home-image-container group">
        <img 
          src="img/Niyog.jpg" 
          alt="Recruitment Poster" 
          className="transition-all duration-700"
        />
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none group-hover:bg-black/0 transition-all"></div>
        
        {/* Floating Tag */}
        <div className="absolute top-8 left-8">
          <div className="bg-brand text-white px-5 py-2 rounded-full font-black text-[10px] tracking-widest uppercase shadow-lg">
            New Opportunity
          </div>
        </div>

        {/* Apply Button - Positioned exactly as requested (right bottom) */}
        <div className="absolute bottom-10 right-10">
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(25,112,117,0.4)] flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 group uppercase"
          >
            <span>Apply Now</span>
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500 border border-white/10">
            <div className="bg-brand p-8 text-white">
              <h2 className="text-2xl font-black uppercase tracking-tight">{APP_CONFIG.instructionTitle}</h2>
              <p className="text-white/70 text-xs mt-1">Please read the following rules before starting.</p>
            </div>
            
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {APP_CONFIG.instructions.map((inst, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-brand/5 text-brand flex items-center justify-center font-black text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="text-gray-600 font-medium text-sm leading-tight">{inst}</p>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-3">
                <button
                  onClick={onApply}
                  className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-black transition-all text-lg shadow-xl shadow-brand/10 active:scale-95"
                >
                  CONTINUE
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
