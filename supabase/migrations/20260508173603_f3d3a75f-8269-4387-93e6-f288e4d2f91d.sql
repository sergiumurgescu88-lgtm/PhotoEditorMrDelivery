
-- 1) Restore EXECUTE on has_role (it's SECURITY DEFINER so safe)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 2) Create deduct_credit RPC used by all edge functions
CREATE OR REPLACE FUNCTION public.deduct_credit(p_amount integer, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance integer;
  v_status account_status;
  v_new_balance integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT credits, account_status INTO v_balance, v_status
  FROM public.profiles WHERE user_id = v_user FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  IF v_status <> 'ACTIVE' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not active');
  END IF;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient credits');
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE public.profiles SET credits = v_new_balance, updated_at = now()
  WHERE user_id = v_user;

  INSERT INTO public.credit_transactions (user_id, type, amount, balance_after, description)
  VALUES (v_user, 'usage', -p_amount, v_new_balance, p_reason);

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.deduct_credit(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.deduct_credit(integer, text) TO authenticated;
