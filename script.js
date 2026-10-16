const schedules = [
  {
    id: 'morning-meeting', date: '2026-10-17', time: '09:00', end: '10:00',
    title: '晨間例會', place: '公司・會議室 A',
    description: '與團隊同步本週工作進度，確認今日優先事項並討論需要協助的問題。',
    notes: '請提前準備簡報與上週工作摘要。',
    attendees: '專案團隊', category: '工作安排'
  },
  {
    id: 'lunch-gathering', date: '2026-10-17', time: '12:30', end: '13:30',
    title: '午餐聚會', place: '小巷日式食堂',
    description: '和同事一起享用午餐，交流最近的專案想法與生活近況。',
    notes: '已預留座位，建議提早 5 分鐘抵達。',
    attendees: '同事 3 人', category: '私人約會'
  },
  {
    id: 'project-review', date: '2026-10-18', time: '15:00', end: '16:30',
    title: '專案進度討論', place: '線上會議',
    description: '檢視目前里程碑與待解決事項，確認下一階段的工作分配與交付日期。',
    notes: '會議連結請查看行事曆邀請，記得準備進度報告。',
    attendees: '專案小組', category: '線上會議'
  }
];

const todos = [
  { id: 'groceries', title: '採買本週早餐食材', done: false },
  { id: 'exercise', title: '安排週末戶外散步路線', done: false },
  { id: 'budget', title: '整理本月生活支出', done: false }
];

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
});
const shortDateFormatter = new Intl.DateTimeFormat('zh-TW', {
  month: 'numeric', day: 'numeric', weekday: 'short'
});

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return shortDateFormatter.format(new Date(year, month - 1, day));
}

function showToday() {
  const now = new Date();
  document.querySelector('#today-date').textContent = dateFormatter.format(now);
}

function renderSchedules() {
  const list = document.querySelector('#schedule-list');
  document.querySelector('#schedule-count').textContent = String(schedules.length);
  document.querySelector('.schedule-panel .section-count').textContent = `${schedules.length} 個安排`;
  schedules.sort((first, second) => {
    const firstDateTime = `${first.date}T${first.time}`;
    const secondDateTime = `${second.date}T${second.time}`;
    return firstDateTime.localeCompare(secondDateTime);
  });
  list.innerHTML = schedules.map((schedule) => `
    <li class="schedule-item">
      <time class="schedule-time" datetime="${schedule.date}T${schedule.time}">${schedule.time}</time>
      <span class="timeline-dot" aria-hidden="true"></span>
      <article class="event-card" data-schedule-id="${schedule.id}">
        <button class="event-toggle" type="button" aria-expanded="false" aria-controls="details-${schedule.id}" data-schedule-toggle="${schedule.id}">
          <span class="event-main">
            <span class="event-title">${schedule.title}</span>
            <span class="event-meta">
              <span>▣ ${formatDate(schedule.date)}・${schedule.time}–${schedule.end}</span>
              <span>⌖ ${schedule.place}</span>
            </span>
          </span>
          <span class="event-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="event-details" id="details-${schedule.id}" hidden>
          <span class="detail-category">${schedule.category}</span>
          <p class="detail-description">${schedule.description}</p>
          <dl class="detail-list">
            <div><dt>參與人員</dt><dd>${schedule.attendees}</dd></div>
            <div><dt>備註</dt><dd>${schedule.notes}</dd></div>
          </dl>
        </div>
      </article>
    </li>
  `).join('');
}

document.querySelector('#schedule-list').addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-schedule-toggle]');
  if (!toggle) return;

  const details = document.querySelector(`#${toggle.getAttribute('aria-controls')}`);
  const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isExpanded));
  details.hidden = isExpanded;
  toggle.closest('.event-card').classList.toggle('is-open', !isExpanded);
});

function renderTodos() {
  const list = document.querySelector('#todo-list');
  document.querySelector('#todo-count').textContent = String(todos.length);
  list.innerHTML = todos.map((todo) => `
    <li class="todo-item${todo.done ? ' is-complete' : ''}">
      <button class="todo-button" type="button" data-todo-id="${todo.id}" aria-pressed="${todo.done}">
        <span class="checkbox" aria-hidden="true">✓</span>
        <span class="todo-text">${todo.title}</span>
        <span class="todo-status">${todo.done ? '已完成' : '待處理'}</span>
      </button>
    </li>
  `).join('');
  updateProgress();
}

function updateProgress() {
  const completed = todos.filter((todo) => todo.done).length;
  const total = todos.length;
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  document.querySelector('#completed-count').textContent = `${completed} / ${total}`;
  document.querySelector('#todo-progress-label').textContent = `${completed} / ${total} 完成`;
  document.querySelector('#progress-fill').style.width = `${percentage}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', String(percentage));
}

document.querySelector('#todo-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-todo-id]');
  if (!button) return;
  const todo = todos.find((item) => item.id === button.dataset.todoId);
  if (!todo) return;
  todo.done = !todo.done;
  renderTodos();
});

document.querySelector('#schedule-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const title = String(formData.get('title')).trim();
  const date = String(formData.get('date'));
  const time = String(formData.get('time'));
  const end = String(formData.get('end'));
  const place = String(formData.get('place')).trim() || '未指定地點';
  const description = String(formData.get('description')).trim() || '尚未新增活動說明。';
  const feedback = document.querySelector('#schedule-form-feedback');
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

  if (!title || !date || !time || !end) {
    feedback.textContent = '請填寫活動內容、日期與開始和結束時間。';
    return;
  }
  if (!timePattern.test(time) || !timePattern.test(end)) {
    feedback.textContent = '請使用 24 小時制輸入時間，例如 09:30 或 14:30。';
    form.elements.time.focus();
    return;
  }
  if (end <= time) {
    feedback.textContent = '結束時間必須晚於開始時間。';
    form.elements.end.focus();
    return;
  }

  schedules.push({
    id: `custom-${Date.now()}`,
    date,
    time,
    end,
    title,
    place,
    description,
    notes: '由使用者新增的自訂行程。',
    attendees: '未指定',
    category: '自訂行程'
  });

  renderSchedules();
  form.reset();
  feedback.textContent = `「${title}」已加入行程。`;
  form.elements.title.focus();
});

showToday();
renderSchedules();
renderTodos();
