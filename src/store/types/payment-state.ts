
import { Payment, Sale } from '@/types';

export interface PaymentState {
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  deletePayment: (paymentId: number) => void;
  pendingSalePayment: Sale | null;
  setPendingSalePayment: (sale: Sale | null) => void;
}
