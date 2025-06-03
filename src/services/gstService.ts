
import { GSTDetails } from '@/types';

// Mock GST data for demonstration
const mockGSTDatabase: Record<string, GSTDetails> = {
  '27AABCU9603R1ZX': {
    gstNumber: '27AABCU9603R1ZX',
    companyName: 'ABC Private Limited',
    address: '123 Business Park, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069'
  },
  '29AABCU9603R1ZY': {
    gstNumber: '29AABCU9603R1ZY',
    companyName: 'XYZ Enterprises',
    address: '456 Tech Hub, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066'
  },
  '36AABCU9603R1ZZ': {
    gstNumber: '36AABCU9603R1ZZ',
    companyName: 'DEF Solutions Pvt Ltd',
    address: '789 IT Corridor, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032'
  }
};

export const validateGSTNumber = (gstNumber: string): boolean => {
  // Basic GST number validation (15 characters, specific pattern)
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gstNumber);
};

export const lookupGSTDetails = async (gstNumber: string): Promise<GSTDetails | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data if found
  return mockGSTDatabase[gstNumber] || null;
};

export const formatGSTNumber = (gstNumber: string): string => {
  // Remove spaces and convert to uppercase
  return gstNumber.replace(/\s/g, '').toUpperCase();
};
