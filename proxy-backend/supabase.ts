import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabase = createClient(supabaseUrl, serviceRoleKey);
export async function validateJwt(token: string) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error('Invalid or expired JWT');
  return data.user;
}
export async function deductCredit(userId: string, reason: string) {
  const { data, error } = await supabase.rpc('deduct_credit', { p_amount: 1, p_reason: reason });
  if (error || !data?.success) throw new Error(data?.error || 'Insufficient credits or RPC failed');
  return data;
}
