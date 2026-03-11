import React, { useEffect, useState } from 'react';
import { createTask, deleteTask, fetchTasks, updateTaskDetails, updateTaskStatus } from './api';
import { CreateTaskInput, Task, TaskStatus } from './types';

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'BLOCKED', label: 'Blocked' },
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(
    null,
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<CreateTaskInput>({
    title: '',
    description: '',
    dueAt: '',
  });

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueAt) {
      setError('Title and due date are required.');
      return;
    }
    try {
      if (editingTask) {
        const updated = await updateTaskDetails(editingTask.id, form);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
        setToast({ message: 'Task updated.', variant: 'success' });
      } else {
        const created = await createTask(form);
        setTasks((prev) => [...prev, created]);
        setToast({ message: 'Task created.', variant: 'success' });
      }
      setForm({ title: '', description: '', dueAt: '' });
      setEditingTask(null);
      setError(null);
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      const updated = await updateTaskStatus(task.id, status);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setToast({ message: 'Task deleted.', variant: 'error' });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? '',
      dueAt: new Date(task.dueAt).toISOString().slice(0, 16),
    });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', dueAt: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">HMCTS Task Manager</h1>
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => void loadTasks()}
          >
            Refresh
          </button>
        </header>

        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTask ? 'Edit task' : 'Create new task'}
          </h2>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="description"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dueAt">
                Due date/time
              </label>
              <input
                id="dueAt"
                name="dueAt"
                type="datetime-local"
                value={form.dueAt}
                onChange={handleChange}
                className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? 'Saving...' : editingTask ? 'Save changes' : 'Create task'}
              </button>
              {editingTask && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="ml-3 inline-flex items-center px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {!loading && tasks.length === 0 && (
            <p className="text-sm text-gray-500">No tasks yet. Create one above.</p>
          )}
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-start justify-between rounded border border-gray-200 p-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(task.dueAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className="rounded border-gray-300 text-sm"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => startEditing(task)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(task)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`rounded-md px-4 py-3 shadow-lg text-sm font-medium text-white ${
              toast.variant === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

