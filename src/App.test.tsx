import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';

beforeEach(() => {
  (global as any).fetch = jest.fn();
});

test('renders page title', () => {
  render(<App />);
  expect(screen.getByText(/HMCTS Task Manager/i)).toBeInTheDocument();
});

test('creates a task successfully and shows success toast', async () => {
  const createdTask = {
    id: 1,
    title: 'New task',
    description: 'Test description',
    status: 'TODO',
    dueAt: new Date().toISOString(),
  };

  (fetch as jest.Mock)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => createdTask,
    });

  render(<App />);

  const titleInput = await screen.findByLabelText(/Title/i);
  const descriptionInput = screen.getByLabelText(/Description \(optional\)/i);
  const dueAtInput = screen.getByLabelText(/Due date\/time/i);

  fireEvent.change(titleInput, { target: { value: 'New task' } });
  fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
  fireEvent.change(dueAtInput, { target: { value: '2030-01-01T10:00' } });

  const submitButton = screen.getByRole('button', { name: /Create task/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  expect(fetch).toHaveBeenLastCalledWith(
    '/api/tasks',
    expect.objectContaining({
      method: 'POST',
    }),
  );

  await waitFor(() => {
    expect(screen.getByText('Task created.')).toBeInTheDocument();
  });
});


