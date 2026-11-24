(function (root) {
  function render(todo, editing) {
    const text = root.TodoEscape.escapeHtml(todo.text);
    const body = editing
      ? `<input class="todo-edit" data-id="${todo.id}" type="text" maxlength="200" enterkeyhint="done" aria-label="할 일 수정" value="${text}">`
      : `<p class="todo-text">${text}</p>`;
    const editButton = editing
      ? ""
      : `<button type="button" data-action="edit" data-id="${todo.id}">수정</button>`;
    return `<li class="todo-item ${todo.completed ? "is-done" : ""}" data-id="${todo.id}">
      <label class="check">
        <input type="checkbox" data-action="toggle" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
        <span class="check-ui" aria-hidden="true"></span>
        <span class="sr-only">${todo.completed ? "완료 해제" : "완료"}</span>
      </label>
      ${body}
      <div class="todo-actions">
        ${editButton}
        <button type="button" data-action="delete" data-id="${todo.id}">삭제</button>
      </div>
    </li>`;
  }

  root.TodoItem = { render };
})(globalThis);
