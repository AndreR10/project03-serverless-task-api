const apiBaseUrl = window.TASK_API_BASE_URL?.replace(/\/$/, "");

const elements = {
  connection: document.querySelector("#connection-label"),
  connectionIndicator: document.querySelector("#connection-indicator"),
  total: document.querySelector("#total-count"),
  progress: document.querySelector("#progress-count"),
  completed: document.querySelector("#completed-count"),
  pending: document.querySelector("#pending-count"),
  navCount: document.querySelector("#nav-count"),
  resultCount: document.querySelector("#result-count"),
  taskList: document.querySelector("#task-list"),
  message: document.querySelector("#message"),
  emptyState: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyCopy: document.querySelector("#empty-copy"),
  search: document.querySelector("#search-input"),
  filter: document.querySelector("#status-filter"),
  dialog: document.querySelector("#task-dialog"),
  form: document.querySelector("#task-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  taskId: document.querySelector("#task-id"),
  title: document.querySelector("#task-title"),
  description: document.querySelector("#task-description"),
  statusField: document.querySelector("#status-field"),
  status: document.querySelector("#task-status"),
  formError: document.querySelector("#form-error"),
  saveButton: document.querySelector("#save-button"),
};

let tasks = [];

function setMessage(message = "", isError = false) {
  elements.message.textContent = message;
  elements.message.classList.toggle("d-none", !message);
  elements.message.classList.toggle("alert-danger", isError);
  elements.message.classList.toggle("alert-secondary", !isError);
}

async function request(path = "", options = {}) {
  if (!apiBaseUrl) {
    throw new Error("The API URL has not been configured for this website.");
  }

  const response = await fetch(`${apiBaseUrl}/v1/tasks${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const responseBody = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(responseBody?.message || `The API returned HTTP ${response.status}.`);
  }
  return responseBody;
}

function updateSummary() {
  const counts = tasks.reduce(
    (result, task) => {
      const status = String(task.status || "PENDING").toUpperCase();
      result.total += 1;
      if (status === "IN_PROGRESS") result.progress += 1;
      else if (status === "COMPLETED") result.completed += 1;
      else result.pending += 1;
      return result;
    },
    { total: 0, progress: 0, completed: 0, pending: 0 },
  );

  elements.total.textContent = counts.total;
  elements.progress.textContent = counts.progress;
  elements.completed.textContent = counts.completed;
  elements.pending.textContent = counts.pending;
  elements.navCount.textContent = counts.total;
}

function makeTaskRow(task, index) {
  const row = document.createElement("article");
  row.className = "row g-0 align-items-center border-bottom px-3 py-3 bg-white";

  const titleCell = document.createElement("div");
  titleCell.className = "col-12 col-lg-4 d-flex align-items-center gap-3";
  const taskIndex = document.createElement("span");
  taskIndex.className = "badge text-bg-light text-success font-monospace";
  taskIndex.textContent = String(index + 1).padStart(2, "0");
  taskIndex.setAttribute("aria-hidden", "true");

  const copy = document.createElement("div");
  copy.className = "flex-grow-1 overflow-hidden";
  const title = document.createElement("h3");
  title.className = "h6 mb-1 text-truncate";
  title.textContent = task.title || "Untitled task";
  const id = document.createElement("p");
  id.className = "small text-secondary font-monospace mb-0 text-truncate";
  id.textContent = task.id;
  copy.append(title, id);
  titleCell.append(taskIndex, copy);

  const status = String(task.status || "PENDING").toUpperCase();
  const statusPill = document.createElement("span");
  const statusColor = status === "COMPLETED"
    ? "success"
    : status === "IN_PROGRESS"
      ? "warning"
      : "secondary";
  statusPill.className = `col-auto col-lg-2 badge text-bg-${statusColor} rounded-pill my-2 my-lg-0`;
  statusPill.textContent = status.replaceAll("_", " ");

  const description = document.createElement("p");
  description.className = "col-12 col-lg-4 small text-secondary text-truncate mb-2 mb-lg-0 ps-5 ps-lg-2";
  description.textContent = task.description || "No description added";

  const actions = document.createElement("div");
  actions.className = "col d-flex justify-content-end gap-2 mt-1 mt-lg-0";
  const editButton = document.createElement("button");
  editButton.className = "btn btn-outline-secondary btn-sm";
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.setAttribute("aria-label", `Edit ${task.title}`);
  editButton.addEventListener("click", () => openDialog(task));

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-outline-danger btn-sm";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  deleteButton.addEventListener("click", () => deleteTask(task));
  actions.append(editButton, deleteButton);

  row.append(titleCell, statusPill, description, actions);
  return row;
}

function renderTasks() {
  const query = elements.search.value.trim().toLowerCase();
  const statusFilter = elements.filter.value;
  const visibleTasks = tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description || ""} ${task.id}`
      .toLowerCase()
      .includes(query);
    const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  elements.taskList.replaceChildren(
    ...visibleTasks.map((task, index) => makeTaskRow(task, index)),
  );
  elements.resultCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "item" : "items"}`;
  elements.emptyState.hidden = visibleTasks.length > 0;
  elements.emptyTitle.textContent = tasks.length ? "No matching tasks" : "Nothing on the board yet";
  elements.emptyCopy.textContent = tasks.length
    ? "Try another search or status filter."
    : "Create a task to see it appear here.";
  document.querySelector("#empty-create-button").hidden = tasks.length > 0;
}

async function loadTasks() {
  elements.connection.textContent = "Connecting…";
  elements.connectionIndicator.className = "badge rounded-pill text-bg-warning";
  setMessage("Loading tasks…");
  try {
    const result = await request();
    tasks = Array.isArray(result) ? result : [];
    elements.connection.textContent = "Connected";
    elements.connectionIndicator.className = "badge rounded-pill text-bg-success";
    updateSummary();
    renderTasks();
    setMessage("");
  } catch (error) {
    elements.connection.textContent = "Connection issue";
    elements.connectionIndicator.className = "badge rounded-pill text-bg-danger";
    setMessage(error.message, true);
    elements.taskList.replaceChildren();
    elements.emptyState.hidden = true;
  }
}

function openDialog(task = null) {
  elements.form.reset();
  elements.formError.textContent = "";
  elements.taskId.value = task?.id || "";
  elements.title.value = task?.title || "";
  elements.description.value = task?.description || "";
  elements.status.value = task?.status || "PENDING";
  elements.statusField.classList.toggle("d-none", !task);
  elements.dialogTitle.textContent = task ? "Edit task" : "Create a task";
  elements.saveButton.innerHTML = task
    ? 'Save changes <span aria-hidden="true">↗</span>'
    : 'Create task <span aria-hidden="true">↗</span>';
  bootstrap.Modal.getOrCreateInstance(elements.dialog).show();
  elements.title.focus();
}

function closeDialog() {
  bootstrap.Modal.getOrCreateInstance(elements.dialog).hide();
}

async function saveTask(event) {
  event.preventDefault();
  elements.formError.textContent = "";
  elements.saveButton.disabled = true;

  const taskId = elements.taskId.value;
  const body = {
    title: elements.title.value.trim(),
    description: elements.description.value.trim(),
  };
  if (taskId) body.status = elements.status.value;

  try {
    await request(taskId ? `/${encodeURIComponent(taskId)}` : "", {
      method: taskId ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    closeDialog();
    setMessage(taskId ? "Task updated." : "Task created.");
    await loadTasks();
  } catch (error) {
    elements.formError.textContent = error.message;
  } finally {
    elements.saveButton.disabled = false;
  }
}

async function deleteTask(task) {
  if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;

  try {
    await request(`/${encodeURIComponent(task.id)}`, { method: "DELETE" });
    setMessage("Task deleted.");
    await loadTasks();
  } catch (error) {
    setMessage(error.message, true);
  }
}

document.querySelector("#new-task-button").addEventListener("click", () => openDialog());
document.querySelector("#empty-create-button").addEventListener("click", () => openDialog());
document.querySelector("#refresh-button").addEventListener("click", loadTasks);
document.querySelector("#dialog-close").addEventListener("click", closeDialog);
document.querySelector("#cancel-button").addEventListener("click", closeDialog);
elements.form.addEventListener("submit", saveTask);
elements.search.addEventListener("input", renderTasks);
elements.filter.addEventListener("change", renderTasks);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.search.focus();
  }
});

loadTasks();
