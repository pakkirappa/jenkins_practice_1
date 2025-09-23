import React, { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import JenkinsInfo from './components/JenkinsInfo';
import axios from 'axios';
import './index.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch todos from backend
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get('/api/todos');
      setTodos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setLoading(false);
    }
  };

  const addTodo = async (text) => {
    try {
      const response = await axios.post('/api/todos', { text });
      setTodos([...todos, response.data]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const todo = todos.find(t => t._id === id);
      const response = await axios.put(`/api/todos/${id}`, {
        completed: !todo.completed
      });
      setTodos(todos.map(t => t._id === id ? response.data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="header">
          <h1>🔧 Jenkins Learning MERN App</h1>
          <p>Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="header">
        <h1>🔧 Jenkins Learning MERN App</h1>
        <p>Learn Jenkins CI/CD with a hands-on MERN stack project!</p>
      </div>

      <TodoForm onSubmit={addTodo} />
      
      <TodoList 
        todos={todos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />

      <JenkinsInfo />
    </div>
  );
}

export default App;