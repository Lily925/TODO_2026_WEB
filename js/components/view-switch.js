(function (root) {
  const VIEWS = [
    ["month", "월별"],
    ["week", "주별"],
    ["day", "일별"]
  ];

  function render(view) {
    const buttons = VIEWS.map(([id, label]) => (
      `<button type="button" data-action="view" data-view="${id}" aria-pressed="${view === id}">${label}</button>`
    )).join("");
    return `<div class="view-switch" role="group" aria-label="보기 전환">${buttons}</div>`;
  }

  root.TodoViewSwitch = { render };
})(globalThis);
