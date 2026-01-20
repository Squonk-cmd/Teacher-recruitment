
import React from 'react';

export const APP_CONFIG = {
  brandColor: '#197075',
  instructionTitle: 'Application Instructions',
  instructions: [
    'Please ensure all information provided is accurate and matches your official documents.',
    'A valid WhatsApp number is required for communication regarding the exam.',
    'The application fee must be paid after submission to generate your admit card.',
    'Supported CV formats: PDF and DOCX only (Max size: 5MB).',
  ],
  paymentLink: 'https://example-payment-gateway.com/pay?ref=teacher-niyog',
  // Dynamic Fees
  fees: {
    'Assistant Teacher': 300,
    'Teacher Assistant': 200
  },
  // Background image for Admit Card PDF
  admitCardBgUrl: 'img/Admit_Card.jpg'
};

export const DEGREE_OPTIONS = ['HSC/Alim', 'Honors/Fazil', 'Masters/Kamil'];
export const POSITION_OPTIONS = ['Assistant Teacher', 'Teacher Assistant'] as const;
export const SUBJECT_OPTIONS = ['Bangla', 'English', 'Arabic', 'Mathematics', 'Social Science', 'Art & Culture'];
