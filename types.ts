
export type LastDegree = 'HSC' | 'Honors' | 'Masters';
export type Position = 'Assistant Teacher' | 'Teacher Assistant';
export type Subject = 'Bangla' | 'English' | 'Arabic' | 'Mathematics' | 'Social Science' | 'Art & Culture';
export type PaymentStatus = 'Approved' | 'Not Approved';

export interface Applicant {
  id?: string;
  serial: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  nid: string;
  lastDegree: LastDegree;
  subject: string; // The text box for their degree subject
  applyFor: Position;
  selectedSubject?: Subject; // Conditional dropdown for Assistant Teacher
  cvName: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  photo?: string,
  cv_url?: string;
}

export interface AdminUser {
  isAuthenticated: boolean;
}
