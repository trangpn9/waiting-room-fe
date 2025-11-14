export interface Patient {
  id: string;
  name: string;
  reason: string;
  created_at: string;
  status: 'waiting' | 'called' | 'in-progress';
}

