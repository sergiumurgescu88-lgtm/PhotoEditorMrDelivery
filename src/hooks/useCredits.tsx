import { useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import { useAuth } from './useAuth';

export const useCredits = () => {
  const { profile, refreshProfile, user } = useAuth();

  const chargeCredit = useCallback(async (action: string, details: string) => {
    if (!profile || !user) return { creditsRemaining: 0, deductedFrom: 'none' };

    if (profile.account_status !== 'ACTIVE') {
      throw new Error('Account not active. Please verify your email.');
    }

    const now = new Date();
    const lastUsage = new Date(profile.last_usage_date);
    let currentDailyUsage = profile.daily_usage;
    if (now.getTime() - lastUsage.getTime() > 24 * 60 * 60 * 1000) {
      currentDailyUsage = 0;
    }

    const dailyLimit = profile.account_tier === 'PREMIUM' ? 100 : 10;
    if (currentDailyUsage >= dailyLimit) {
      throw new Error('Daily limit reached. Upgrade for more!');
    }

    let newFree = profile.free_credits;
    let newPurchased = profile.purchased_credits;
    let deductedFrom = '';

    if (newFree > 0) { newFree--; deductedFrom = 'Free'; }
    else if (newPurchased > 0) { newPurchased--; deductedFrom = 'Purchased'; }
    else { throw new Error('Out of credits! Purchase a package.'); }

    const newTier = newPurchased > 0 ? 'PREMIUM' : 'FREE';
    const newCredits = newFree + newPurchased;

    await pb.collection('profiles').update(profile.id, {
      free_credits: newFree,
      purchased_credits: newPurchased,
      credits: newCredits,
      total_generations: profile.total_generations + 1,
      daily_usage: currentDailyUsage + 1,
      last_usage_date: now.toISOString(),
      account_tier: newTier,
    });

    await refreshProfile();
    return { creditsRemaining: newCredits, deductedFrom };
  }, [profile, user, refreshProfile]);

  const purchaseCredits = useCallback(async (credits: number) => {
    if (!profile || !user) return { creditsRemaining: 0, deductedFrom: 'none' };

    if (profile.account_status !== 'ACTIVE') {
      throw new Error('Please verify email first.');
    }

    const newPurchased = profile.purchased_credits + credits;
    const newCredits = profile.free_credits + newPurchased;

    await pb.collection('profiles').update(profile.id, {
      purchased_credits: newPurchased,
      credits: newCredits,
      account_tier: 'PREMIUM',
    });

    await refreshProfile();
  }, [profile, user, refreshProfile]);

  return { chargeCredit, purchaseCredits, profile };
};
