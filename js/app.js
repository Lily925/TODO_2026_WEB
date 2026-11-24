(function (root) {
  const { escapeHtml } = root.TodoEscape;
  const store = root.TodoStore;
  const calendar = root.TodoCalendar;
  const app = document.getElementById("app");

  const state = {
    view: "month",
    selected: calendar.today(),
    filter: "all",
    editingId: null,
    error: "",
    draft: "",
    suspendBlur: false,
    focusDraft: false
  };

  function selectedKey() {
    return calendar.toDateKey(state.selected);
  }

  function render() {
    const key = selectedKey();
    const counts = store.countsForDate(key);
    const items = store.forDate(key, state.filter);
    const period = calendar.formatPeriod(state.selected, state.view);
    const [previousLabel, nextLabel] = calendar.navLabels(state.view);
    document.title = `${period} · 할 일`;

    state.suspendBlur = true;
    app.innerHTML = `<main class="app">
      <header class="top">
        <div class="brand">
          <h1>할 일</h1>
          <p class="period">${escapeHtml(period)}</p>
        </div>
        <div class="toolbar">
          <button type="button" class="today" data-action="today">오늘</button>
          <div class="nav">
            <button type="button" data-action="nav" data-dir="-1" aria-label="${previousLabel}">이전</button>
            <button type="button" data-action="nav" data-dir="1" aria-label="${nextLabel}">다음</button>
          </div>
          ${root.TodoViewSwitch.render(state.view)}
        </div>
      </header>
      ${calendar.render(state.view, state.selected, key, store.summaryByDate())}
      <section class="panel" aria-label="선택한 날짜의 할 일">
        ${state.view === "day" ? "" : `<h2>${escapeHtml(calendar.formatDay(state.selected))}</h2>`}
        ${root.TodoInput.render(state.draft, state.error, state.selected)}
        ${root.TodoFilter.render({ filter: state.filter, remaining: counts.open, counts })}
        ${root.TodoList.render(items, state.editingId, counts.total)}
      </section>
    </main>`;
    state.suspendBlur = false;
    const shouldFocusDraft = state.focusDraft;
    state.focusDraft = false;

    if (state.editingId) {
      const input = app.querySelector(".todo-edit");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
      return;
    }
    if (shouldFocusDraft) {
      const draft = app.querySelector(".todo-draft");
      if (draft) draft.focus();
    }
  }

  function pendingEdit() {
    const editor = app.querySelector(".todo-edit");
    if (!state.editingId || !editor) return null;
    return { id: state.editingId, value: editor.value };
  }

  function savePendingEdit() {
    const pending = pendingEdit();
    if (!pending) return true;
    return commitEdit(pending.id, pending.value);
  }

  function commitAdd() {
    const text = state.draft.trim();
    if (!text) {
      state.error = "내용을 입력해 주세요.";
      state.focusDraft = true;
      render();
      return;
    }
    store.addTodo(text, selectedKey());
    state.draft = "";
    state.error = "";
    if (state.filter === "done") state.filter = "all";
    state.focusDraft = true;
    render();
  }

  function commitEdit(id, value) {
    const text = value.trim();
    if (!text) {
      state.error = "내용을 입력해 주세요.";
      render();
      return false;
    }
    store.updateText(id, text);
    state.editingId = null;
    state.error = "";
    render();
    return true;
  }

  function selectDay(key) {
    state.selected = calendar.parseDateKey(key);
    state.editingId = null;
    state.error = "";
    render();
  }

  app.addEventListener("mousedown", (event) => {
    if (!state.editingId) return;
    const actionElement = event.target.closest("[data-action]");
    if (actionElement && actionElement.dataset.action !== "toggle") event.preventDefault();
  });

  app.addEventListener("submit", (event) => {
    if (!event.target.matches(".todo-form")) return;
    event.preventDefault();
    const draft = event.target.querySelector(".todo-draft").value;
    if (!savePendingEdit()) return;
    state.draft = draft;
    commitAdd();
  });

  app.addEventListener("input", (event) => {
    if (!event.target.matches(".todo-draft")) return;
    state.draft = event.target.value;
    if (!state.error) return;
    state.error = "";
    const alert = app.querySelector(".form-error");
    if (alert) alert.textContent = "";
  });

  app.addEventListener("focusout", (event) => {
    if (!event.target.matches(".todo-edit")) return;
    const id = event.target.dataset.id;
    const value = event.target.value;
    setTimeout(() => {
      if (state.suspendBlur || state.editingId !== id) return;
      commitEdit(id, value);
    }, 0);
  });

  app.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target.matches(".todo-draft") && event.key === "Enter") {
      event.preventDefault();
      state.draft = target.value;
      commitAdd();
      return;
    }
    if (target.matches(".todo-edit") && event.key === "Enter") {
      event.preventDefault();
      commitEdit(target.dataset.id, target.value);
      return;
    }
    if (target.matches(".todo-edit") && event.key === "Escape") {
      state.editingId = null;
      state.error = "";
      render();
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && target.matches(".week-col")) {
      event.preventDefault();
      selectDay(target.dataset.date);
    }
  });

  app.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches('[data-action="toggle"]')) return;
    const id = input.dataset.id;
    if (state.editingId === id) {
      const editor = app.querySelector(".todo-edit");
      if (editor && !commitEdit(id, editor.value)) return;
    }
    store.toggleTodo(id);
    render();
  });

  app.addEventListener("dblclick", (event) => {
    const text = event.target.closest(".todo-text");
    if (!text) return;
    state.editingId = text.closest(".todo-item").dataset.id;
    state.error = "";
    render();
  });

  app.addEventListener("click", (event) => {
    const element = event.target.closest("[data-action]");
    if (!element || element.matches('[data-action="toggle"]')) return;
    const action = element.dataset.action;
    const actionId = element.dataset.id;
    const keepsOpenEdit = action === "delete" && actionId === state.editingId;
    if (!keepsOpenEdit && !savePendingEdit()) return;

    if (action === "nav") {
      state.selected = calendar.shift(state.selected, state.view, Number(element.dataset.dir));
      state.editingId = null;
      state.error = "";
      render();
      return;
    }
    if (action === "today") {
      state.selected = calendar.today();
      state.editingId = null;
      state.error = "";
      render();
      return;
    }
    if (action === "view") {
      state.view = element.dataset.view;
      state.editingId = null;
      render();
      return;
    }
    if (action === "select-day") {
      selectDay(element.dataset.date);
      return;
    }
    if (action === "filter") {
      state.filter = element.dataset.filter;
      state.editingId = null;
      state.error = "";
      render();
      return;
    }
    if (action === "clear-completed") {
      store.clearCompleted(selectedKey());
      state.editingId = null;
      render();
      return;
    }
    if (action === "edit") {
      state.editingId = element.dataset.id;
      state.error = "";
      render();
      return;
    }
    if (action === "delete") {
      store.deleteTodo(element.dataset.id);
      if (state.editingId === element.dataset.id) state.editingId = null;
      render();
    }
  });

  render();
})(globalThis);
