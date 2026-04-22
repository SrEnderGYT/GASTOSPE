export type MovementType = 'ingreso' | 'egreso' | 'pago';

export interface FinanceRecord {
  id: string;
  createdAt: string;
  movementType: MovementType;
  amount: number;
  category: string;
  note: string;
  source: 'manual' | 'whatsapp' | 'iphone-shortcuts';
  synced: boolean;
}
