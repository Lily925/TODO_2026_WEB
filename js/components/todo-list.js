(function (root) {
  function render(items, editingId, totalCount) {
    if (!items.length) {
      const message = totalCount === 0
        ? "등록된 할 일이 없습니다. 새로운 할 일을 추가해보세요!"
        : "해당하는 할 일이 없습니다.";
      return `<p class="empty">${message}</p>`;
    }
    const list = items.map((item) => root.TodoItem.render(item, item.id === editingId)).join("");
    return `<ul class="todo-list">${list}</ul>`;
  }

  root.TodoList = { render };
})(globalThis);
