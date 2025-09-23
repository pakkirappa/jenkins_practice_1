import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock axios to prevent actual API calls during testing
jest.mock('axios');

describe('App Component', () => {
  test('renders Jenkins MERN Learning App header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Jenkins Learning MERN App/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders loading state initially', () => {
    render(<App />);
    const loadingElement = screen.getByText(/Loading your todos/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('contains Jenkins learning description', () => {
    render(<App />);
    const descriptionElement = screen.getByText(/Learn Jenkins CI\/CD with a hands-on MERN stack project/i);
    expect(descriptionElement).toBeInTheDocument();
  });
});