import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders create form by default', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
		expect(screen.getByText('Ajouter')).toBeInTheDocument();
	});

	it('renders edit form when mode is edit', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Existing', description: 'Desc' }}
			/>
		);
		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByText('Modifier')).toBeInTheDocument();
		expect(screen.getByLabelText('Titre')).toHaveValue('Existing');
		expect(screen.getByLabelText('Description')).toHaveValue('Desc');
	});

	it('shows validation error when title is empty', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		fireEvent.submit(screen.getByTestId('task-form'));
		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
	});

	it('calls onSubmit with trimmed values', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: '  My task  ' },
		});
		fireEvent.change(screen.getByLabelText('Description'), {
			target: { value: '  My desc  ' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'My task',
			description: 'My desc',
		});
	});

	it('clears form after submit in create mode', () => {
		render(<TaskForm onSubmit={vi.fn()} />);

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: 'Task' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(screen.getByLabelText('Titre')).toHaveValue('');
	});

	it('does not clear form after submit in edit mode', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Task' }}
			/>
		);

		fireEvent.submit(screen.getByTestId('task-form'));

		expect(screen.getByLabelText('Titre')).toHaveValue('Task');
	});

	it('clears validation error when user types after error', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		fireEvent.submit(screen.getByTestId('task-form'));
		expect(screen.getByRole('alert')).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: 'New title' },
		});
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('calls onCancel when cancel button clicked', () => {
		const onCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

		fireEvent.click(screen.getByText('Annuler'));
		expect(onCancel).toHaveBeenCalled();
	});

	it('does not render cancel button if onCancel is not provided', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
	});

	it('does not submit when title is only whitespace', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: '   ' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole('alert')).toBeInTheDocument();
	});
});