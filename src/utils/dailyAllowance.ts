import { DailyAllowanceState, CommunitySponsorshipPool } from '../types';

const ALLOWANCE_KEY = 'talking_terms_daily_allowance';
const SPONSORSHIP_KEY = 'talking_terms_community_pool';

export function getDailyAllowance(): DailyAllowanceState {
  const today = new Date().toISOString().split('T')[0];
  try {
    const raw = localStorage.getItem(ALLOWANCE_KEY);
    if (!raw) {
      const initial: DailyAllowanceState = {
        lastClaimDate: today,
        streakDays: 1,
        freeMinutesAvailable: 5,
        totalClaimedAllTime: 5,
      };
      localStorage.setItem(ALLOWANCE_KEY, JSON.stringify(initial));
      return initial;
    }

    const data: DailyAllowanceState = JSON.parse(raw);
    if (data.lastClaimDate !== today) {
      // New day calculation
      const lastDate = new Date(data.lastClaimDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const newStreak = diffDays === 1 ? data.streakDays + 1 : 1;
      const updated: DailyAllowanceState = {
        lastClaimDate: today,
        streakDays: newStreak,
        freeMinutesAvailable: 5, // 5 free minutes daily allowance
        totalClaimedAllTime: data.totalClaimedAllTime + 5,
      };
      localStorage.setItem(ALLOWANCE_KEY, JSON.stringify(updated));
      return updated;
    }
    return data;
  } catch {
    return {
      lastClaimDate: today,
      streakDays: 1,
      freeMinutesAvailable: 5,
      totalClaimedAllTime: 5,
    };
  }
}

export function deductDailyMinutes(minutes: number): DailyAllowanceState {
  const current = getDailyAllowance();
  const remaining = Math.max(0, current.freeMinutesAvailable - minutes);
  const updated: DailyAllowanceState = {
    ...current,
    freeMinutesAvailable: remaining,
  };
  try {
    localStorage.setItem(ALLOWANCE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update daily allowance', e);
  }
  return updated;
}

export function getCommunityPool(): CommunitySponsorshipPool {
  try {
    const raw = localStorage.getItem(SPONSORSHIP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalSponsoredMinutes: 4850,
    availableMinutesForStudents: 1240,
    activeDonorsCount: 168,
  };
}

export function contributeToCommunityPool(minutes: number): CommunitySponsorshipPool {
  const current = getCommunityPool();
  const updated: CommunitySponsorshipPool = {
    totalSponsoredMinutes: current.totalSponsoredMinutes + minutes,
    availableMinutesForStudents: current.availableMinutesForStudents + minutes,
    activeDonorsCount: current.activeDonorsCount + 1,
  };
  try {
    localStorage.setItem(SPONSORSHIP_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function claimStudentSponsoredMinutes(): number {
  const current = getCommunityPool();
  if (current.availableMinutesForStudents >= 10) {
    const updated: CommunitySponsorshipPool = {
      ...current,
      availableMinutesForStudents: current.availableMinutesForStudents - 10,
    };
    try {
      localStorage.setItem(SPONSORSHIP_KEY, JSON.stringify(updated));
    } catch {}
    return 10;
  }
  return 0;
}
