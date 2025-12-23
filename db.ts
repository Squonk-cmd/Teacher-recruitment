
import { Applicant } from './types';

/* 
-- SQL SCHEMA REFERENCE --
CREATE TABLE applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial SERIAL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    nid VARCHAR(50) NOT NULL,
    last_degree VARCHAR(50) NOT NULL,
    degree_subject VARCHAR(255) NOT NULL,
    apply_for VARCHAR(100) NOT NULL,
    selected_subject VARCHAR(100),
    cv_name VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'Not Approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

const DB_KEY = 'teacher_recruitment_applicants';

export const saveApplicant = (data: Omit<Applicant, 'id' | 'serial' | 'createdAt' | 'paymentStatus'>): Applicant => {
  const existing = getApplicants();
  const newApplicant: Applicant = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    serial: existing.length + 1,
    paymentStatus: 'Not Approved',
    createdAt: new Date().toISOString(),
  };
  
  const updated = [...existing, newApplicant];
  localStorage.setItem(DB_KEY, JSON.stringify(updated));
  return newApplicant;
};

export const getApplicants = (): Applicant[] => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
};

export const updateApplicantStatus = (id: string, status: Applicant['paymentStatus']): void => {
  const applicants = getApplicants();
  const updated = applicants.map(a => a.id === id ? { ...a, paymentStatus: status } : a);
  localStorage.setItem(DB_KEY, JSON.stringify(updated));
};

export const updateApplicantData = (id: string, data: Partial<Applicant>): void => {
  const applicants = getApplicants();
  const updated = applicants.map(a => a.id === id ? { ...a, ...data } : a);
  localStorage.setItem(DB_KEY, JSON.stringify(updated));
};
