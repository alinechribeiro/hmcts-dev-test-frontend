export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueAt: string;
}

export interface UpdateTaskInput {
  title: string;
  description?: string;
  dueAt: string;
}

