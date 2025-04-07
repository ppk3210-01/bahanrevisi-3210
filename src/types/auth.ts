
export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
}
