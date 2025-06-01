
// Define a basic Profile type for type safety
export interface Profile {
  name?: string | null;
  user_type: string;
  phone: string;
  school: string;
  referral_source: string;
}
