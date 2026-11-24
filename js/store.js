(function (root) {
  const STORAGE_KEY = "todo-app-v1";

  let todos = load();

  function isTodo(item) {
    return Boolean(item)
      && typeof item.id === "string"
      && typeof item.text === "string"
      && typeof item.completed === "boolean"
      && typeof item.createdAt === "number"
      && typeof item.date === "string";
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isTodo) : [];
    } catch (error) {
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      // Private mode or a full disk should not block the current screen.
    }
  }

  function createId() {
    if (globalThis.crypto && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addTodo(text, date) {
    const next = text.trim().slice(0, 200);
    if (!next) return null;
    const todo = {
      id: createId(),
      text: next,
      completed: false,
      createdAt: Date.now(),
      date
    };
    todos = [todo, ...todos];
    persist();
    return { ...todo };
  }

  function updateText(id, text) {
    const next = text.trim().slice(0, 200);
    if (!next) return false;
    let found = false;
    todos = todos.map((todo) => {
      if (todo.id !== id) return todo;
      found = true;
      return { ...todo, text: next };
    });
    if (found) persist();
    return found;
  }

  function toggleTodo(id) {
    todos = todos.map((todo) => (
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
    persist();
  }

  function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    persist();
  }

  function clearCompleted(date) {
    todos = todos.filter((todo) => !(todo.date === date && todo.completed));
    persist();
  }

  function forDate(date, filter) {
    return todos
      .filter((todo) => todo.date === date)
      .filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "done") return todo.completed;
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((todo) => ({ ...todo }));
  }

  function summaryByDate() {
    const summary = {};
    todos.forEach((todo) => {
      if (!summary[todo.date]) summary[todo.date] = { total: 0, open: 0 };
      summary[todo.date].total += 1;
      if (!todo.completed) summary[todo.date].open += 1;
    });
    return summary;
  }

  function countsForDate(date) {
    const items = todos.filter((todo) => todo.date === date);
    const open = items.filter((todo) => !todo.completed).length;
    return {
      total: items.length,
      open,
      done: items.length - open
    };
  }

  root.TodoStore = {
    addTodo,
    updateText,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    forDate,
    summaryByDate,
    countsForDate
  };
})(globalThis);
