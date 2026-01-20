
import React, { useState, useEffect } from 'react';
import { getApplicants, updateApplicantStatus, updateApplicantData } from '../db';
import { Applicant, Position, Subject, LastDegree } from '../types';
import { POSITION_OPTIONS, SUBJECT_OPTIONS, DEGREE_OPTIONS } from '../constants';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Lock, 
  LogOut, 
  FileDown,
  X,
  User,
  Phone,
  Briefcase,
  ExternalLink, // Add this one
  Trash2
} from 'lucide-react';
import { generateAdmitCardPDF } from '../services/AdmitCardGenerator';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  
  // Edit State
  

  useEffect(() => {
  if (isAuthenticated) {
    refreshData();
  }
}, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'abcdwxyz634') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid admin credentials.');
    }
  };

  // 1. Fetch Real Data from PostgreSQL
  const refreshData = async () => {
  console.log("FETCH START: Requesting data from server...");
  try {
    const response = await fetch('https://ukacollegiate.school/api/applicants');
    const rawData = await response.json();
    
    
    console.log("RAW DATA FROM DB:", rawData);

    const formattedData = rawData.map((row: any) => {
  // Use a fallback chain to find the image filename
  const photoFileName = row.photo_url || row.photo_path || row.photo;
  const cvFileName = row.cv_url || row.cv_path || row.cv;

  return {
    ...row,
    id: (row.id ?? row.serial ?? Math.random()).toString(),
    name: row.name || "No Name",
    phone: row.phone || "No Phone",
    nid: row.nid || "",
    applyFor: row.apply_for || row.applyFor || "N/A",
    selectedSubject: row.selected_subject || row.selectedSubject || "N/A",
    paymentStatus: row.payment_status || row.paymentStatus || "Pending",
    
    // Construct full URLs
    photo: photoFileName 
      ? `https://ukacollegiate.school/uploads/${photoFileName}` 
      : null,
    cv_url: cvFileName 
      ? `https://ukacollegiate.school/uploads/${cvFileName}` 
      : null,
      
    serial: row.serial || 0
  };
});

    setApplicants(formattedData);
  } catch (error) {
    console.error("FETCH ERROR:", error);
  }
};

  // 2. Handle Status Update (Payment)
  const handleStatusUpdate = async (id: string | number, status: string) => {
    try {
      await fetch(`https://ukacollegiate.school/api/applicants/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status })
      });
      refreshData(); // Reload list after update
    } catch (error) {
      alert("Failed to update status");
    }
  };

  // 3. Handle Save Edits
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApplicant) {
      try {
        const response = await fetch(`https://ukacollegiate.school/api/applicants/${editingApplicant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingApplicant)
        });
        
        if (response.ok) {
          setEditingApplicant(null);
          refreshData();
        }
      } catch (error) {
        alert("Error updating applicant data");
      }
    }
  };
	// 4. Handle Delete Applicant
const handleDelete = async (id: string | number, name: string) => {
  // Always ask for confirmation before deleting
  const confirmed = window.confirm(`Are you sure you want to delete the record for ${name}? This action cannot be undone.`);
  
  if (confirmed) {
    try {
      const response = await fetch(`https://ukacollegiate.school/api/applicants/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Option 1: Refresh everything from DB
        refreshData(); 
        // Option 2: Local state filter (faster UI feel)
        // setApplicants(applicants.filter(a => a.id !== id));
      } else {
        alert("Failed to delete the record.");
      }
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Error connecting to the server.");
    }
  }
};
  const filteredApplicants = applicants.filter((applicant) => {
  // 1. Search Term Filter (Name, Phone, or NID)
  const searchLower = searchTerm.toLowerCase();
  const matchesSearch = 
    applicant.name.toLowerCase().includes(searchLower) ||
    applicant.phone.includes(searchLower) ||
    (applicant.nid && applicant.nid.includes(searchLower));

  // 2. Role (Category) Filter
  const matchesRole = 
    roleFilter === 'All' || 
    applicant.applyFor === roleFilter;

  // 3. Subject (Specialization) Filter
  const matchesSubject = 
    subjectFilter === 'All' || 
    applicant.selectedSubject === subjectFilter;

  return matchesSearch && matchesRole && matchesSubject;
});

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-center text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 text-center mb-10">Secure Management Portal</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Master Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all"
                required
              />
            </div>
            <button className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand/20 transition-all hover:-translate-y-1">
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* Sidebar */}
      <aside className="w-72 bg-brand text-white hidden lg:flex flex-col p-8 fixed h-full z-10">
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter italic">TEACHER PORTAL</h2>
          <div className="h-1 w-12 bg-white/30 mt-2 rounded-full"></div>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button className="w-full text-left p-4 bg-white/10 rounded-2xl flex items-center gap-4 transition-all border border-white/5">
            <Briefcase className="w-5 h-5 opacity-80" />
            <span className="font-bold">Dashboard</span>
          </button>
        </nav>

        <button 
          onClick={() => setIsAuthenticated(false)}
          className="flex items-center gap-4 p-4 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Exit Panel</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 flex-1 p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-brand font-bold text-sm tracking-widest uppercase mb-1">Overview</p>
              <h1 className="text-4xl font-black text-gray-900">Applicant Registry</h1>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand transition-colors" />
              <input 
                type="text"
                placeholder="Search Name, Phone, NID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-brand/5 focus:border-brand outline-none transition-all"
              />
            </div>
          </header>

          {/* Filters */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category</label>
              <div className="relative">
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-gray-50 border-none font-bold text-gray-700 py-3 px-4 rounded-xl focus:ring-2 focus:ring-brand/10 outline-none appearance-none cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  {POSITION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Specialization</label>
              <select 
                value={subjectFilter} 
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full bg-gray-50 border-none font-bold text-gray-700 py-3 px-4 rounded-xl focus:ring-2 focus:ring-brand/10 outline-none appearance-none cursor-pointer"
              >
                <option value="All">All Subjects</option>
                {SUBJECT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="bg-brand text-white p-5 rounded-3xl shadow-xl shadow-brand/20 flex items-center justify-between">
              <div>
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest block mb-1">Active File Count</label>
                <span className="text-3xl font-black">{filteredApplicants.length}</span>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Filter className="w-6 h-6" />
              </div>
            </div>
          </section>

          {/* Table */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Serial</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                
                  {filteredApplicants.map((a) => (
                    <tr key={a.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="font-mono text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                          #{ (a.id ?? 0).toString().padStart(4, '0') }
                        </span>
                      </td>
                      <td className="px-8 py-6">
  <div className="flex items-center gap-4">
    {/* Profile Picture / Avatar logic */}
    <div className="relative group/avatar">
      {a.photo ? (
        <img 
          src={a.photo} 
          alt={a.name}
          className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-100 shadow-sm group-hover/avatar:scale-110 transition-transform cursor-pointer"
          onClick={() => window.open(a.photo, '_blank')}
        />
      ) : (
        <div className="w-12 h-12 bg-brand/5 text-brand rounded-2xl flex items-center justify-center font-black text-sm border-2 border-brand/10">
          {a.name.charAt(0)}
        </div>
      )}
      
      {/* Small indicator for status */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${a.paymentStatus === 'Approved' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
    </div>

    <div>
      <div className="font-bold text-gray-900 group-hover:text-brand transition-colors flex items-center gap-2">
        {a.name}
        {a.photo && <User className="w-3 h-3 text-gray-300" />}
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Phone className="w-3 h-3" />
        {a.phone}
      </div>
    </div>
  </div>
</td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-semibold text-gray-700">{a.applyFor}</div>
                        <div className="text-[10px] font-bold text-gray-400">
                          {a.applyFor === 'Assistant Teacher' ? a.selectedSubject : 'T.A. Pool'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={a.paymentStatus}
                          onChange={(e) => handleStatusUpdate(a.id, e.target.value as Applicant['paymentStatus'])}
                          className={`text-[10px] font-black px-4 py-2 rounded-xl border-none focus:ring-0 cursor-pointer transition-all ${
                            a.paymentStatus === 'Approved' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <option value="Approved">APPROVED</option>
                          <option value="Not Approved">PENDING</option>
                        </select>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* 1. View CV Button */}
    {a.cv_url && (
      <button 
        onClick={() => window.open(a.cv_url, '_blank')}
        className="p-3 bg-white border border-gray-100 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        title="View CV"
      >
        <ExternalLink className="w-4 h-4" />
      </button>
    )}
                          <button 
                            onClick={async () => await generateAdmitCardPDF(a)}
                            className="p-3 bg-white border border-gray-100 text-brand rounded-xl hover:bg-brand hover:text-white transition-all shadow-sm"
                            title="Admit Card"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingApplicant(a)}
                            className="p-3 bg-white border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-800 hover:text-white transition-all shadow-sm"
                            title="Edit Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
			{/* NEW: Delete Button */}
    <button 
      onClick={() => handleDelete(a.id, a.name)}
      className="p-3 bg-white border border-gray-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
      title="Delete Applicant"
    >
      <Trash2 className="w-4 h-4" />
    </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredApplicants.length === 0 && (
                <div className="py-24 text-center">
                  <div className="text-gray-300 mb-2 font-black text-xl italic uppercase">No Matching Records</div>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingApplicant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase italic">Edit Profile</h2>
                  <p className="text-xs text-gray-400 mt-1">ID: {editingApplicant.id}</p>
                </div>
                <button 
                  onClick={() => setEditingApplicant(null)}
                  className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editingApplicant.name}
                    onChange={(e) => setEditingApplicant({...editingApplicant, name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                  <input 
                    type="text" 
                    value={editingApplicant.phone}
                    onChange={(e) => setEditingApplicant({...editingApplicant, phone: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Position</label>
                  <select 
                    value={editingApplicant.applyFor}
                    onChange={(e) => setEditingApplicant({...editingApplicant, applyFor: e.target.value as Position})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                  >
                    {POSITION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {editingApplicant.applyFor === 'Assistant Teacher' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Subject</label>
                    <select 
                      value={editingApplicant.selectedSubject}
                      onChange={(e) => setEditingApplicant({...editingApplicant, selectedSubject: e.target.value as Subject})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                    >
                      {SUBJECT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Degree</label>
                  <select 
                    value={editingApplicant.lastDegree}
                    onChange={(e) => setEditingApplicant({...editingApplicant, lastDegree: e.target.value as LastDegree})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                  >
                    {DEGREE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    value={editingApplicant.email}
                    onChange={(e) => setEditingApplicant({...editingApplicant, email: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 pt-6">
                  <button className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-2xl shadow-brand/20 transition-all hover:-translate-y-1 active:scale-95">
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
