import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/taskApi';

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

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			})
		);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTasks throws on error response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Server error'),
			})
		);

		await expect(getTasks()).rejects.toThrow('HTTP 500: Server error');
	});

	it('getTask returns a single task', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockTask),
			})
		);

		const task = await getTask(1);
		expect(task).toEqual(mockTask);
		expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
	});

	it('getTask throws on error response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			})
		);

		await expect(getTask(999)).rejects.toThrow('HTTP 404: Not found');
	});

	it('createTask posts data and returns created task', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockTask),
		});
		vi.stubGlobal('fetch', fetchMock);

		const payload = { title: 'Test', description: 'desc' };
		const task = await createTask(payload);

		expect(task).toEqual(mockTask);
		expect(fetchMock).toHaveBeenCalledWith('/api/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
	});

	it('createTask throws on error response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve('Bad request'),
			})
		);

		await expect(createTask({ title: 'x' })).rejects.toThrow('HTTP 400: Bad request');
	});

	it('updateTask sends PUT and returns updated task', async () => {
		const updated = { ...mockTask, completed: true };
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(updated),
		});
		vi.stubGlobal('fetch', fetchMock);

		const result = await updateTask(1, { completed: true });

		expect(result).toEqual(updated);
		expect(fetchMock).toHaveBeenCalledWith('/api/tasks/1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ completed: true }),
		});
	});

	it('updateTask throws on error response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Server error'),
			})
		);

		await expect(updateTask(1, { title: 'x' })).rejects.toThrow('HTTP 500: Server error');
	});

	it('deleteTask sends DELETE request', async () => {
		const fetchMock = vi.fn().mockResolvedValue({ ok: true });
		vi.stubGlobal('fetch', fetchMock);

		await deleteTask(1);

		expect(fetchMock).toHaveBeenCalledWith('/api/tasks/1', { method: 'DELETE' });
	});

	it('deleteTask throws on error response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found'),
			})
		);

		await expect(deleteTask(999)).rejects.toThrow('HTTP 404: Not found');
	});
});