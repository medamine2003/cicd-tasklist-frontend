import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const baseTask: Task = {
	id: 1,
	title: 'Test task',
	description: 'Some description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders task title and description', () => {
		render(
			<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		expect(screen.getByText('Test task')).toBeInTheDocument();
		expect(screen.getByText('Some description')).toBeInTheDocument();
	});

	it('does not render description when null', () => {
		render(
			<TaskItem
				task={{ ...baseTask, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.queryByText('Some description')).not.toBeInTheDocument();
	});

	it('applies completed class when task is completed', () => {
		render(
			<TaskItem
				task={{ ...baseTask, completed: true }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
	});

	it('calls onToggle when checkbox is clicked', () => {
		const onToggle = vi.fn();
		render(
			<TaskItem task={baseTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		fireEvent.click(screen.getByRole('checkbox'));
		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('requires confirmation before deleting', () => {
		const onDelete = vi.fn();
		render(
			<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
		);

		const deleteButton = screen.getByLabelText('Supprimer');
		fireEvent.click(deleteButton);
		expect(onDelete).not.toHaveBeenCalled();

		fireEvent.click(deleteButton);
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('switches to edit mode and saves changes', () => {
		const onEdit = vi.fn();
		render(
			<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);

		fireEvent.click(screen.getByLabelText('Modifier'));
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: 'Updated title' },
		});
		fireEvent.click(screen.getByText('Enregistrer'));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Updated title',
			description: 'Some description',
		});
	});

	it('does not save edit when title is empty', () => {
		const onEdit = vi.fn();
		render(
			<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);

		fireEvent.click(screen.getByLabelText('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: '   ' },
		});
		fireEvent.click(screen.getByText('Enregistrer'));

		expect(onEdit).not.toHaveBeenCalled();
	});

	it('cancels edit and reverts values', () => {
		render(
			<TaskItem task={baseTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);

		fireEvent.click(screen.getByLabelText('Modifier'));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: 'Changed' },
		});
		fireEvent.click(screen.getByText('Annuler'));

		expect(screen.getByText('Test task')).toBeInTheDocument();
		expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
	});
});