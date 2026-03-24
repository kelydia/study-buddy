import { create } from 'zustand';

const TASKS_KEY = 'study-buddy-tasks';

const loadTasks = () => {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const useTaskStore = create((set, get) => ({
  tasks: loadTasks(),

  addTask: (task) => {
    const newTask = {
      id: Date.now().toString(),
      title: task.title,
      subject: task.subject, // 'english' | 'chinese'
      type: task.type, // 'dictation' | 'reading'
      audioPath: task.audioPath,
      status: 'pending', // 'pending' | 'in-progress' | 'passed' | 'retry'
      attempts: 0,
      score: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    const tasks = [...get().tasks, newTask];
    saveTasks(tasks);
    set({ tasks });
  },

  updateTask: (id, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    saveTasks(tasks);
    set({ tasks });
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    set({ tasks });
  },

  getTodayTasks: () => {
    const today = new Date().toDateString();
    return get().tasks.filter(
      (t) => new Date(t.createdAt).toDateString() === today
    );
  },

  reset: () => {
    saveTasks([]);
    set({ tasks: [] });
  },
}));
