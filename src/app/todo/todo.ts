import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export type Filter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.html',
  styleUrl: './todo.css'
})
export class TodoComponent {
  todos = signal<TodoItem[]>([]);
  newTodoText = signal('');
  filter = signal<Filter>('all');
  editingId = signal<number | null>(null);
  editingText = signal('');

  private nextId = 1;

  filteredTodos = computed(() => {
    const f = this.filter();
    return this.todos().filter(todo => {
      if (f === 'active') return !todo.completed;
      if (f === 'completed') return todo.completed;
      return true;
    });
  });

  activeCount = computed(() => this.todos().filter(t => !t.completed).length);
  completedCount = computed(() => this.todos().filter(t => t.completed).length);
  allCompleted = computed(() => this.todos().length > 0 && this.activeCount() === 0);

  addTodo() {
    const text = this.newTodoText().trim();
    if (!text) return;
    this.todos.update(todos => [
      ...todos,
      { id: this.nextId++, text, completed: false }
    ]);
    this.newTodoText.set('');
  }

  toggleTodo(id: number) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }

  deleteTodo(id: number) {
    this.todos.update(todos => todos.filter(t => t.id !== id));
  }

  startEdit(todo: TodoItem) {
    this.editingId.set(todo.id);
    this.editingText.set(todo.text);
  }

  confirmEdit(id: number) {
    const text = this.editingText().trim();
    if (text) {
      this.todos.update(todos =>
        todos.map(t => t.id === id ? { ...t, text } : t)
      );
    }
    this.editingId.set(null);
    this.editingText.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editingText.set('');
  }

  toggleAll() {
    const shouldComplete = !this.allCompleted();
    this.todos.update(todos => todos.map(t => ({ ...t, completed: shouldComplete })));
  }

  clearCompleted() {
    this.todos.update(todos => todos.filter(t => !t.completed));
  }

  setFilter(f: Filter) {
    this.filter.set(f);
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.addTodo();
  }

  handleEditKeydown(event: KeyboardEvent, id: number) {
    if (event.key === 'Enter') this.confirmEdit(id);
    if (event.key === 'Escape') this.cancelEdit();
  }
}
