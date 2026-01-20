import React, { useState } from 'react';
import { APP_CONFIG } from '../constants';
import { ChevronRight } from 'lucide-react';

interface HomeProps {
  onApply: () => void;
}

const Home: React.FC<HomeProps> = ({ onApply }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    // Outer viewport: Stays black
    <div className="h-screen w-full bg-black flex items-center justify-center overflow-hidden p-0">
      
      {/* THE FIX: 
         - 'relative' creates the anchor for the button.
         - 'max-h-full' and 'max-w-full' ensures this div is NEVER larger than the image 
           OR the screen. This keeps the button pinned to the image edge.
      */}
      <div className="relative max-h-full max-w-full flex items-center justify-center leading-[0]">
        
        {/* Image: 'object-contain' ensures the whole image is seen */}
        <img 
          src="img/Niyog.jpg" 
          alt="Recruitment Poster" 
          className="max-h-screen max-w-full w-auto h-auto object-contain transition-all duration-700"
        />
        
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        
        {/* Floating Tag - Scales slightly for mobile */}
        <div className="absolute top-[4%] left-[4%] sm:top-8 sm:left-8">
          <div className="bg-brand text-white px-3 py-1 sm:px-5 sm:py-2 rounded-full font-black text-[8px] sm:text-[10px] tracking-widest uppercase shadow-lg">
            New Opportunity
          </div>
        </div>

        {/* Apply Button: 
           Positioned relative to the IMAGE container. 
           On mobile, we use percentages (%) so it doesn't feel too far in.
        */}
        <div className="absolute bottom-[5%] right-[5%] sm:bottom-10 sm:right-10">
          <button
            onClick={() => setShowModal(true)}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-lg shadow-2xl flex items-center gap-2 sm:gap-3 transition-all transform hover:scale-105 active:scale-95 group uppercase"
          >
            <span>Apply Now</span>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Instructions Modal (Remains same) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border border-white/10">
            <div className="bg-brand p-8 text-white">
              <h2 className="text-2xl font-black uppercase tracking-tight">{APP_CONFIG.instructionTitle}</h2>
              <p className="text-white/70 text-xs mt-1">Please read the following rules before starting.</p>
            </div>
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {APP_CONFIG.instructions.map((inst, idx) => (
                  <li key={idx} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-brand/5 text-brand flex items-center justify-center font-black text-[10px]">{idx + 1}</span>
                    <p className="text-gray-600 font-medium text-sm leading-tight">{inst}</p>
                  </li>
                ))}
              </ul>
              <div className="space-y-3">
                <button onClick={onApply} className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-black transition-all text-lg shadow-xl active:scale-95">CONTINUE</button>
                <button onClick={() => setShowModal(false)} className="w-full text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
