import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoForm from './TodoForm';

describe('TodoForm Component', () => {
  test('renders todo input and button', () => {
    const mockOnSubmit = jest.fn();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const inputElement = screen.getByPlaceholderText(/Add a new todo/i);
    const buttonElement = screen.getByText(/Add Todo/i);
    
    expect(inputElement).toBeInTheDocument();
    expect(buttonElement).toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted with valid input', () => {
    const mockOnSubmit = jest.fn();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const inputElement = screen.getByPlaceholderText(/Add a new todo/i);
    const buttonElement = screen.getByText(/Add Todo/i);
    
    fireEvent.change(inputElement, { target: { value: 'Learn Jenkins' } });
    fireEvent.click(buttonElement);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Learn Jenkins');
  });

  test('does not call onSubmit when form is submitted with empty input', () => {
    const mockOnSubmit = jest.fn();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const buttonElement = screen.getByText(/Add Todo/i);
    fireEvent.click(buttonElement);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('clears input after successful submission', () => {
    const mockOnSubmit = jest.fn();
    render(<TodoForm onSubmit={mockOnSubmit} />);
    
    const inputElement = screen.getByPlaceholderText(/Add a new todo/i);
    const buttonElement = screen.getByText(/Add Todo/i);
    
    fireEvent.change(inputElement, { target: { value: 'Learn Jenkins' } });
    fireEvent.click(buttonElement);
    
    expect(inputElement.value).toBe('');
  });
});