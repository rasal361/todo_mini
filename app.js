/* ─── State ──────────────────────────────────────────────────────────────── */
let todos  = JSON.parse(localStorage.getItem('todos-v2') || '[]');
let filter = 'all';

/* ─── Date & Tagline ─────────────────────────────────────────────────────── */
const DAYS    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TAGLINES = [
  'A productive day starts here.',
  'One task at a time.',
  'Focus. Execute. Repeat.',
  'Small steps, big progress.',
  'Make today count.',
];

(function initMeta() {
  const now  = new Date();
  document.getElementById('date-chip').textContent =
    `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  const taglineEl = document.getElementById('tagline');
  taglineEl.textContent = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
})();

/* ─── Persist ────────────────────────────────────────────────────────────── */
function save() {
  localStorage.setItem('todos-v2', JSON.stringify(todos));
}

/* ─── Render ─────────────────────────────────────────────────────────────── */
function render() {
  const list       = document.getElementById('todo-list');
  const total      = todos.length;
  const doneCount  = todos.filter(t => t.done).length;
  const activeCount = total - doneCount;
  const pct        = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  // Progress
  document.getElementById('progress-fill').style.width  = pct + '%';
  document.getElementById('progress-label').textContent = pct + '%';

  // Footer info
  const countInfo = document.getElementById('count-info');
  countInfo.innerHTML =
    `<strong>${activeCount}</strong> left · <strong>${doneCount}</strong> done`;

  // Filtered list
  const visible = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'done')   return  t.done;
    return true;
  });

  if (visible.length === 0) {
    const msgs = {
      all:    ['✦', 'Nothing here yet. Add your first task!'],
      active: ['✔', 'All tasks completed. You\'re crushing it!'],
      done:   ['◎', 'No completed tasks yet.'],
    };
    const [icon, text] = msgs[filter];
    list.innerHTML = `
      <li class="empty">
        <div class="empty-icon">${icon}</div>
        <p>${text}</p>
      </li>`;
    return;
  }

  list.innerHTML = visible.map((t, i) => `
    <li
      class="todo-item ${t.done ? 'done' : ''}"
      data-id="${t.id}"
      style="animation-delay: ${i * 0.04}s"
    >
      <div class="check-wrap">
        <input type="checkbox" id="chk-${t.id}" ${t.done ? 'checked' : ''} />
        <label for="chk-${t.id}" aria-label="Toggle done"></label>
      </div>
      <span class="todo-text">${escapeHtml(t.text)}</span>
      <button class="btn-delete" data-id="${t.id}" aria-label="Delete task" title="Delete">×</button>
    </li>
  `).join('');

  // Events: checkboxes
  list.querySelectorAll('input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const id   = chk.closest('.todo-item').dataset.id;
      const todo = todos.find(t => t.id === id);
      if (todo) { todo.done = chk.checked; save(); render(); }
    });
  });

  // Events: delete buttons
  list.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.todo-item');
      item.style.transition = 'opacity 0.2s, transform 0.2s';
      item.style.opacity    = '0';
      item.style.transform  = 'translateX(20px)';
      setTimeout(() => {
        todos = todos.filter(t => t.id !== btn.dataset.id);
        save(); render();
      }, 200);
    });
  });
}

/* ─── Add Task ───────────────────────────────────────────────────────────── */
function addTask() {
  const input = document.getElementById('task-input');
  const text  = input.value.trim();
  if (!text) {
    input.focus();
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 400);
    return;
  }
  todos.unshift({ id: Date.now().toString(), text, done: false });
  input.value = '';
  save(); render();
}

document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

/* ─── Filters ────────────────────────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

/* ─── Clear completed ────────────────────────────────────────────────────── */
document.getElementById('clear-done').addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  save(); render();
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

/* ─── Init ───────────────────────────────────────────────────────────────── */
render();
