export interface Patient {
  id: string;
  name: string;
  reason: string;
  createdAt: number;
  status: 'waiting' | 'called' | 'in-progress';
}

