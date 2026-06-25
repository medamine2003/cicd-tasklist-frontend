import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('useTasks', () => {
	it('loads tasks on mount', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.error).toBeNull();
	});

	it('sets error when loading fails', async () => {
		vi.spyOn(taskApi, 'getTasks').mockRejectedValue(new Error('Network error'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Network error');
		expect(result.current.tasks).toEqual([]);
	});

	it('adds a task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([]);
		vi.spyOn(taskApi, 'createTask').mockResolvedValue(mockTask);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Test' });
		});

		expect(result.current.tasks).toEqual([mockTask]);
	});

	it('edits a task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updated = { ...mockTask, title: 'Updated' };
		vi.spyOn(taskApi, 'updateTask').mockResolvedValue(updated);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Updated' });
		});

		expect(result.current.tasks).toEqual([updated]);
	});

	it('removes a task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		vi.spyOn(taskApi, 'deleteTask').mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([]);
	});

	it('toggles task completion', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const toggled = { ...mockTask, completed: true };
		vi.spyOn(taskApi, 'updateTask').mockResolvedValue(toggled);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks).toEqual([toggled]);
	});

	it('does nothing when toggling a non-existent task', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);
		const updateSpy = vi.spyOn(taskApi, 'updateTask');

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(updateSpy).not.toHaveBeenCalled();
	});

	it('allows manual reload via loadTasks', async () => {
		vi.spyOn(taskApi, 'getTasks').mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.loadTasks();
		});

		expect(taskApi.getTasks).toHaveBeenCalledTimes(2);
	});
});