
import React, { useState } from 'react';
import { saveApplicant } from '../db';
import { DEGREE_OPTIONS, POSITION_OPTIONS, SUBJECT_OPTIONS } from '../constants';
import { Applicant, LastDegree, Position, Subject } from '../types';
import { Upload, ArrowLeft } from 'lucide-react';

interface ApplicationFormProps {
  onSubmit: (applicant: Applicant) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    nid: '',
    lastDegree: '' as LastDegree,
    subject: '',
    applyFor: '' as Position,
    selectedSubject: '' as Subject,
    cvName: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf' || extension === 'docx') {
      setFormData(prev => ({ ...prev, cvName: file.name }));
      setCvFile(file); // Store the actual binary file
    } else {
      alert('Please upload a PDF or DOCX file.');
    }
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  // 1. Maintain your business logic
  const submissionData = {
    ...formData,
    selectedSubject: formData.applyFor === 'Assistant Teacher' ? formData.selectedSubject : '',
  };

  // 2. Create FormData
  const data = new FormData();

  // 3. Type-safe loop
  Object.entries(submissionData).forEach(([key, value]) => {
    // We cast value to string because FormData.append(key, string | Blob)
    // and we ensure we don't send 'undefined' as a string literal
    data.append(key, (value ?? '').toString());
  });
  
  // 4. Append the actual file (ensure the key 'cv' matches your backend)
  if (cvFile) {
    data.append('cv', cvFile);
  }

  try {
    const response = await fetch('http://localhost:5000/api/apply', {
      method: 'POST',
      body: data, // Note: Do NOT set Content-Type header; fetch does it automatically for FormData
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const result = await response.json();
    onSubmit(result.data); 
  } catch (error) {
    console.error("Submission Error:", error);
    alert("Error saving application.");
  } finally {
    setIsSubmitting(false);
  }
};

  const inputClasses = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <button 
          onClick={() => window.location.hash = ''}
          className="flex items-center text-gray-500 hover:text-brand transition-colors gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-brand p-8 text-white text-center">
          <h1 className="text-3xl font-bold uppercase">Registration Page</h1>
          <p className="mt-2 text-teal-50">Please fill in your details to apply for the position.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Full Name</label>
              <input 
                type="text" required name="name" value={formData.name} onChange={handleChange}
                placeholder="Enter your full name" className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>Phone (WhatsApp Number)</label>
              <input 
                type="tel" required name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+880 1XXX XXXXXX" className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>Email Address</label>
              <input 
                type="email" required name="email" value={formData.email} onChange={handleChange}
                placeholder="yourname@example.com" className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>NID Number</label>
              <input 
                type="text" required name="nid" value={formData.nid} onChange={handleChange}
                placeholder="Your NID Number" className={inputClasses} 
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Full Address</label>
            <textarea 
              required name="address" value={formData.address} onChange={handleChange}
              rows={3} placeholder="House, Road, Area, City" className={inputClasses} 
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Last Degree</label>
              <select 
                required name="lastDegree" value={formData.lastDegree} onChange={handleChange}
                className={inputClasses}
              >
                <option value="">Select Degree</option>
                {DEGREE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Subject (of Degree)</label>
              <input 
                type="text" required name="subject" value={formData.subject} onChange={handleChange}
                placeholder="e.g. B.Sc in Physics" className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>Apply For Position</label>
              <select 
                required name="applyFor" value={formData.applyFor} onChange={handleChange}
                className={inputClasses}
              >
                <option value="">Select Position</option>
                {POSITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {formData.applyFor === 'Assistant Teacher' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <label className={labelClasses}>Select Subject to Teach</label>
                <select 
                  required name="selectedSubject" value={formData.selectedSubject} onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="">Select Subject</option>
                  {SUBJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group">
            <input 
              type="file" 
              required 
              onChange={handleFileChange}
              accept=".pdf,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-3 group-hover:text-brand transition-colors" />
              <p className="text-gray-600 font-medium">
                {formData.cvName || 'Upload your CV (PDF or DOCX)'}
              </p>
              <p className="text-gray-400 text-sm mt-1">Maximum file size: 5MB</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-900/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                SUBMITTING...
              </>
            ) : (
              'SUBMIT APPLICATION'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
