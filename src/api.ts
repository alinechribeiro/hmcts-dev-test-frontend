import { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from './types';

const BASE_URL = '/api/tasks';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error('Failed to load tasks');
  }
  return res.json();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    description: input.description,
    // datetime-local -> ISO8601 with offset for Spring's OffsetDateTime
    dueAt: new Date(input.dueAt).toISOString(),
  };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to create task');
  }
  return res.json();
}

export async function updateTaskDetails(id: number, input: UpdateTaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    description: input.description,
    dueAt: new Date(input.dueAt).toISOString(),
  };

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to update task');
  }
  return res.json();
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update status');
  }
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
}

