(function (root) {
  function render(draft, error, date) {
    const placeholder = `${date.getMonth() + 1}월 ${date.getDate()}일에 할 일을 입력하세요`;
    return `<form class="todo-form">
      <label class="sr-only" for="todo-draft">새 할 일</label>
      <input id="todo-draft" class="todo-draft" type="text" maxlength="200" enterkeyhint="done" autocomplete="off" placeholder="${root.TodoEscape.escapeHtml(placeholder)}" value="${root.TodoEscape.escapeHtml(draft)}">
      <button type="submit">추가</button>
      <p class="form-error" role="alert">${root.TodoEscape.escapeHtml(error)}</p>
    </form>`;
  }

  root.TodoInput = { render };
})(globalThis);
