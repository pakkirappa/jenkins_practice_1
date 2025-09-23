import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from './TodoItem';

describe('TodoItem Component', () => {
  const mockTodo = {
    _id: '1',
    text: 'Learn Jenkins Pipeline',
    completed: false
  };

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders todo text', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const todoText = screen.getByText('Learn Jenkins Pipeline');
    expect(todoText).toBeInTheDocument();
  });

  test('renders complete button for incomplete todo', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const completeButton = screen.getByText(/✅ Complete/i);
    expect(completeButton).toBeInTheDocument();
  });

  test('renders undo button for completed todo', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const undoButton = screen.getByText(/↩️ Undo/i);
    expect(undoButton).toBeInTheDocument();
  });

  test('calls onToggle when complete/undo button is clicked', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const toggleButton = screen.getByText(/✅ Complete/i);
    fireEvent.click(toggleButton);
    
    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  test('calls onDelete when delete button is clicked', () => {
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByText(/🗑️ Delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  test('applies completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoItem todo={completedTodo} onToggle={mockOnToggle} onDelete={mockOnDelete} />);
    
    const todoItem = screen.getByRole('listitem');
    expect(todoItem).toHaveClass('completed');
  });
});