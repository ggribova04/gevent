export interface User {
  id: number;
  fullName: string;
  email: string;
  role?: string;
  specialization?: string;
  city?: string;
  description?: string;
  photoUrl?: string;
}