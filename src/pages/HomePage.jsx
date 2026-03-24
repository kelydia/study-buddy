import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import { ProgressPanel } from '@/components/ProgressPanel';
import { ToastContainer } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { useTaskStore } from '@/stores/taskStore';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const todayTasks = tasks.filter((t) => {
    const taskDate = new Date(t.createdAt).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  const pendingTasks = todayTasks.filter((t) => t.status === 'pending');
  const completedTasks = todayTasks.filter((t) => t.status === 'passed');

  const handleAddTask = (taskData) => {
    addTask(taskData);
    addToast('任务添加成功！', 'success');
  };

  const handleSelectTask = (task) => {
    navigate(`/practice/${task.id}`);
  };

  return (
    <div className="container py-8 px-4 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Study Buddy</h1>
        <p className="text-muted-foreground">让学习更有趣</p>
      </header>

      <ProgressPanel />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">今日任务</h2>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加任务
          </Button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">今天还没有任务</p>
            <Button variant="outline" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加第一个任务
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  待完成 ({pendingTasks.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSelect={handleSelectTask}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  已完成 ({completedTasks.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSelect={handleSelectTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
        addToast={addToast}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
