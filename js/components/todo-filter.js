(function (root) {
  const TABS = [
    ["all", "전체"],
    ["active", "진행 중"],
    ["done", "완료됨"]
  ];

  function render({ filter, remaining, counts }) {
    const tabs = TABS.map(([id, label]) => {
      const count = id === "all" ? counts.total : id === "active" ? counts.open : counts.done;
      return `<button type="button" data-action="filter" data-filter="${id}" aria-pressed="${filter === id}">${label} <span>${count}</span></button>`;
    }).join("");
    return `<div class="list-tools">
      <div class="filters" role="group" aria-label="상태 필터">${tabs}</div>
      <div class="list-meta">
        <p class="remaining">남은 할 일 <strong>${remaining}</strong>개</p>
        <button type="button" data-action="clear-completed" ${counts.done === 0 ? "disabled" : ""}>완료된 항목 삭제</button>
      </div>
    </div>`;
  }

  root.TodoFilter = { render };
})(globalThis);
