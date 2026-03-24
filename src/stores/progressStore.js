import { create } from 'zustand';

const PROGRESS_KEY = 'study-buddy-progress';

const loadProgress = () => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data
      ? JSON.parse(data)
      : {
          points: 0,
          streak: 0,
          lastPracticeDate: null,
          achievements: [],
          totalPractices: 0,
          totalPassed: 0,
        };
  } catch {
    return {
      points: 0,
      streak: 0,
      lastPracticeDate: null,
      achievements: [],
      totalPractices: 0,
      totalPassed: 0,
    };
  }
};

const saveProgress = (progress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const useProgressStore = create((set, get) => ({
  ...loadProgress(),

  addPoints: (points) => {
    const progress = { ...get(), points: get().points + points };
    saveProgress(progress);
    set({ points: progress.points });
  },

  updateStreak: () => {
    const today = new Date().toDateString();
    const lastDate = get().lastPracticeDate;
    let streak = get().streak;

    if (lastDate) {
      const last = new Date(lastDate).toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (last === yesterday) {
        streak += 1;
      } else if (last !== today) {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    const progress = { ...get(), streak, lastPracticeDate: today };
    saveProgress(progress);
    set({ streak, lastPracticeDate: today });
  },

  recordPractice: () => {
    const progress = { ...get(), totalPractices: get().totalPractices + 1 };
    saveProgress(progress);
    set({ totalPractices: progress.totalPractices });
  },

  recordPassed: () => {
    const progress = { ...get(), totalPassed: get().totalPassed + 1 };
    saveProgress(progress);
    set({ totalPassed: progress.totalPassed });
  },

  unlockAchievement: (achievement) => {
    if (!get().achievements.includes(achievement)) {
      const achievements = [...get().achievements, achievement];
      const progress = { ...get(), achievements };
      saveProgress(progress);
      set({ achievements });
    }
  },

  checkAndUnlockAchievements: () => {
    const progress = get();
    const newAchievements = [];

    if (progress.totalPractices >= 1 && !progress.achievements.includes('first-practice')) {
      newAchievements.push('first-practice');
    }
    if (progress.totalPractices >= 10 && !progress.achievements.includes('practice-10')) {
      newAchievements.push('practice-10');
    }
    if (progress.streak >= 3 && !progress.achievements.includes('streak-3')) {
      newAchievements.push('streak-3');
    }
    if (progress.streak >= 7 && !progress.achievements.includes('streak-7')) {
      newAchievements.push('streak-7');
    }
    if (progress.totalPassed >= 10 && !progress.achievements.includes('pass-10')) {
      newAchievements.push('pass-10');
    }

    if (newAchievements.length > 0) {
      const achievements = [...progress.achievements, ...newAchievements];
      const updatedProgress = { ...progress, achievements };
      saveProgress(updatedProgress);
      set({ achievements });
    }

    return newAchievements;
  },
}));

export const ACHIEVEMENTS = {
  'first-practice': { name: '初次练习', description: '完成第一次练习' },
  'practice-10': { name: '勤奋练习', description: '完成10次练习' },
  'streak-3': { name: '连续3天', description: '连续练习3天' },
  'streak-7': { name: '坚持一周', description: '连续练习7天' },
  'pass-10': { name: '满分达人', description: '通过10个任务' },
};
