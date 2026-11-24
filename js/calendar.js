(function (root) {
  const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  function today() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  }

  function toDateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function parseDateKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day, 12);
  }

  function addDays(date, amount) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
  }

  function startOfWeek(date) {
    return addDays(date, -date.getDay());
  }

  function shift(date, view, direction) {
    if (view === "month") return addMonths(date, direction);
    if (view === "week") return addDays(date, direction * 7);
    return addDays(date, direction);
  }

  function addMonths(date, amount) {
    const day = date.getDate();
    const next = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);
    const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, last));
    return next;
  }

  function monthCells(cursor) {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
    const start = startOfWeek(first);
    const cells = [];
    for (let index = 0; index < 42; index += 1) {
      const date = addDays(start, index);
      cells.push({
        date,
        key: toDateKey(date),
        inMonth: date.getMonth() === cursor.getMonth()
      });
    }
    while (cells.length > 28 && cells.slice(-7).every((cell) => !cell.inMonth)) {
      cells.splice(-7, 7);
    }
    return cells;
  }

  function weekDays(date) {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  function formatMonth(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  }

  function formatDay(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
  }

  function formatWeek(date) {
    const days = weekDays(date);
    const start = days[0];
    const end = days[6];
    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getDate()}일`;
    }
    if (sameYear) {
      return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`;
    }
    return `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }

  function formatPeriod(date, view) {
    if (view === "week") return formatWeek(date);
    if (view === "day") return formatDay(date);
    return formatMonth(date);
  }

  function navLabels(view) {
    if (view === "week") return ["이전 주", "다음 주"];
    if (view === "day") return ["이전 날", "다음 날"];
    return ["이전 달", "다음 달"];
  }

  function dayLabel(date, total) {
    const base = `${date.getMonth() + 1}월 ${date.getDate()}일`;
    return total ? `${base}, 할 일 ${total}개` : base;
  }

  function render(view, cursor, selectedKey, summary) {
    if (view === "day") return "";
    if (view === "week") return renderWeek(cursor, selectedKey, summary);
    return renderMonth(cursor, selectedKey, summary);
  }

  function renderMonth(cursor, selectedKey, summary) {
    const todayKey = toDateKey(today());
    const names = WEEKDAYS.map((name, index) => {
      const tone = index === 0 ? "is-sun" : index === 6 ? "is-sat" : "";
      return `<div class="dow ${tone}">${name}</div>`;
    }).join("");
    const cells = monthCells(cursor).map((cell) => {
      const info = summary[cell.key] || { total: 0, open: 0 };
      const classes = [
        "day",
        cell.inMonth ? "" : "is-outside",
        cell.key === selectedKey ? "is-selected" : "",
        cell.key === todayKey ? "is-today" : "",
        cell.date.getDay() === 0 ? "is-sun" : "",
        cell.date.getDay() === 6 ? "is-sat" : ""
      ].filter(Boolean).join(" ");
      const badge = info.total
        ? `<span class="badge ${info.open === 0 ? "is-clear" : ""}">${info.total}</span>`
        : "";
      return `<button type="button" class="${classes}" data-action="select-day" data-date="${cell.key}" aria-pressed="${cell.key === selectedKey}" aria-label="${dayLabel(cell.date, info.total)}">
        <span class="day-num">${cell.date.getDate()}</span>
        ${badge}
      </button>`;
    }).join("");

    return `<section class="calendar" aria-label="월별 달력">
      <div class="dow-row">${names}</div>
      <div class="month-grid">${cells}</div>
    </section>`;
  }

  function renderWeek(cursor, selectedKey, summary) {
    const todayKey = toDateKey(today());
    const columns = weekDays(cursor).map((date) => {
      const key = toDateKey(date);
      const info = summary[key] || { total: 0, open: 0 };
      const previews = root.TodoStore.forDate(key, "all").slice(0, 3);
      const items = previews.map((todo) => (
        `<li class="${todo.completed ? "is-done" : ""}">${root.TodoEscape.escapeHtml(todo.text)}</li>`
      )).join("");
      const more = info.total > 3 ? `<li class="more">+${info.total - 3}</li>` : "";
      const classes = [
        "week-col",
        key === selectedKey ? "is-selected" : "",
        key === todayKey ? "is-today" : ""
      ].filter(Boolean).join(" ");
      return `<div class="${classes}" data-action="select-day" data-date="${key}" role="button" tabindex="0" aria-pressed="${key === selectedKey}" aria-label="${dayLabel(date, info.total)}">
        <div class="week-head">
          <span class="dow ${date.getDay() === 0 ? "is-sun" : ""} ${date.getDay() === 6 ? "is-sat" : ""}">${WEEKDAYS[date.getDay()]}</span>
          <span class="day-num">${date.getDate()}</span>
        </div>
        <ul class="week-todos">${items}${more}</ul>
      </div>`;
    }).join("");

    return `<section class="calendar" aria-label="주별 달력"><div class="week-scroll"><div class="week-grid">${columns}</div></div></section>`;
  }

  root.TodoCalendar = {
    today,
    toDateKey,
    parseDateKey,
    shift,
    formatDay,
    formatPeriod,
    navLabels,
    render
  };
})(globalThis);
