import React from 'react';

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <span>{todo.text}</span>
      <div className="todo-actions">
        <button
          onClick={() => onToggle(todo._id)}
          className="complete-btn"
        >
          {todo.completed ? '↩️ Undo' : '✅ Complete'}
        </button>
        <button
          onClick={() => onDelete(todo._id)}
          className="delete-btn"
        >
          🗑️ Delete
        </button>
      </div>
    </li>
  );
}

export default TodoItem;