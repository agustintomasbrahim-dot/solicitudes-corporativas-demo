const catalogItems = [
  {
    area: "Tecnologia",
    path: "Tecnologia / Sistemas / Accesos / Alta de usuario",
    team: "Tecnologia Nivel 1",
    summary: "Usuarios, permisos, correo, Teams, sistemas y seguridad.",
    subject: "Alta de usuario para nuevo ingreso",
    description: "Nuevo colaborador ingresa el lunes. Necesita acceso a correo, Teams y sistema de gestion.",
    fieldOne: ["Fecha necesaria", "date", "2026-09-12"],
    fieldTwo: ["Aprobador", "text", "Coordinador de area"]
  },
  {
    area: "Marketing",
    path: "Marketing / Imagen interior / Carteleria / Reposicion",
    team: "Marketing",
    summary: "POP, grafica, carteleria, marquesinas, vidrieras y mobiliario.",
    subject: "Reposicion de carteleria interior",
    description: "Sucursal solicita reposicion de material grafico para nueva campania.",
    fieldOne: ["Sucursal", "text", "Sucursal 139 - Salta"],
    fieldTwo: ["Material requerido", "text", "Carteleria A3 + cenefa"]
  },
  {
    area: "Talento",
    path: "Talento / ABM usuarios / Modificacion de datos",
    team: "Talento",
    summary: "Altas, bajas, cambios, legajos, puestos y accesos asociados.",
    subject: "Actualizar puesto en legajo",
    description: "Se solicita modificar puesto y centro de costo del colaborador.",
    fieldOne: ["Legajo", "text", "12345"],
    fieldTwo: ["Vigencia", "date", "2026-09-15"]
  },
  {
    area: "Tarjetas",
    path: "Tarjetas / Medios de pago / Transaccion duplicada",
    team: "Tarjetas",
    summary: "Consultas de pagos, devoluciones, autorizaciones y duplicados.",
    subject: "Operacion duplicada en tarjeta",
    description: "Cliente informa dos cargos para la misma compra. Se adjunta comprobante.",
    fieldOne: ["Nro de operacion", "text", "OP-778210"],
    fieldTwo: ["Monto", "text", "$ 86.400"]
  },
  {
    area: "Negocios",
    path: "Negocios / Precios / Diferencia contra POS",
    team: "Negocios",
    summary: "Precios, diferencias, reportes comerciales y consultas de sucursal.",
    subject: "Diferencia de precio en POS",
    description: "Sucursal detecta diferencia entre precio publicado y precio en caja.",
    fieldOne: ["SKU", "text", "DX-AR-4410"],
    fieldTwo: ["Marca", "text", "Dexter"]
  }
];

const seedTickets = [
  {
    id: "SC-1048", title: "Reposicion de carteleria interior", category: "Marketing / Imagen interior / Carteleria",
    priority: "Alta", status: "En curso", dueHours: 8, team: "Marketing", waiting: "Agente",
    requester: "Sucursal 139", origin: "Web", type: "Requerimiento", mine: true,
    text: "Sucursal solicita reposicion de carteleria interior para nueva campania. Adjunta fotos del sector.",
    fields: { Sucursal: "139", Material: "Carteleria interior" },
    timeline: ["09:14|Ticket creado desde portal web", "09:14|Asignado automaticamente por categoria", "09:27|Coordinador agrego nota interna"]
  },
  {
    id: "SC-1047", title: "Alta de usuario para nuevo ingreso", category: "Tecnologia / Sistemas / Accesos",
    priority: "Media", status: "Asignado", dueHours: 31, team: "Tecnologia Nivel 1", waiting: "Agente",
    requester: "Casa Central", origin: "Web", type: "Requerimiento", mine: true,
    text: "Nuevo ingreso requiere correo, Teams y permisos basicos para sistema de gestion.",
    fields: { "Fecha necesaria": "12/09/2026", Aprobador: "Coordinador de area" },
    timeline: ["10:03|Ticket creado desde portal web", "10:04|Asignado a Tecnologia Nivel 1"]
  },
  {
    id: "SC-1046", title: "Diferencia de precio contra POS", category: "Negocios / Precios",
    priority: "Alta", status: "Sin asignar", dueHours: 3, team: "Negocios", waiting: "Coordinador",
    requester: "Sucursal 184", origin: "Email", type: "Incidente", mine: false,
    text: "Sucursal informa diferencia entre precio publicado y precio en caja.",
    fields: { SKU: "DX-AR-4410", Marca: "Dexter" },
    timeline: ["11:20|Ticket creado desde email"]
  },
  {
    id: "SC-1045", title: "Operacion duplicada en tarjeta", category: "Tarjetas / Medios de pago",
    priority: "Critica", status: "Esperando tercero", dueHours: 1, team: "Tarjetas", waiting: "Autorizadora",
    requester: "Sucursal 216", origin: "Telefono", type: "Incidente", mine: false,
    text: "Cliente reclama doble impacto de pago. Se requiere validar con autorizadora.",
    fields: { Operacion: "OP-778210", Monto: "$ 86.400" },
    timeline: ["08:45|Ticket creado por agente", "08:51|Consulta enviada a autorizadora"]
  }
];

const storageKey = "solicitudes-demo-tickets-v2";
const validViews = new Set(["portal", "inbox", "reports", "admin"]);
const slaHours = { Baja: 72, Media: 48, Alta: 12, Critica: 5 };
const teamRotation = ["Tecnologia Nivel 1", "Marketing", "Talento", "Tarjetas", "Negocios"];
let tickets = loadTickets();
let activeFilter = "open";
let selectedTicketId = tickets[0]?.id || null;
let selectedCatalogIndex = 0;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function loadTickets() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(saved) && saved.length ? saved : structuredClone(seedTickets);
  } catch {
    return structuredClone(seedTickets);
  }
}

function saveTickets() {
  localStorage.setItem(storageKey, JSON.stringify(tickets));
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function setView(viewId, updateHash = true) {
  const targetId = validViews.has(viewId) ? viewId : "portal";
  const targetView = $(`#${targetId}`);
  const targetNav = $(`.nav-item[data-view="${targetId}"]`);
  if (!targetView || !targetNav) return;

  $$(".nav-item").forEach((item) => {
    const active = item === targetNav;
    item.classList.toggle("active", active);
    item.setAttribute("aria-current", active ? "page" : "false");
  });
  $$(".view").forEach((view) => view.classList.toggle("active", view === targetView));
  if (updateHash && location.hash !== `#${targetId}`) history.pushState(null, "", `#${targetId}`);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function renderCatalog() {
  $("#catalog").innerHTML = catalogItems.map((item, index) => `
    <button type="button" class="${index === selectedCatalogIndex ? "active" : ""}" data-index="${index}" aria-pressed="${index === selectedCatalogIndex}">
      <span class="catalog-area">${escapeHtml(item.area)}</span>
      <strong>${escapeHtml(item.path)}</strong>
      <span>${escapeHtml(item.summary)}</span>
    </button>
  `).join("");
}

function renderDynamicField(container, config) {
  const [label, type, value] = config;
  container.innerHTML = `${escapeHtml(label)}<input type="${escapeHtml(type)}" value="${escapeHtml(value)}" aria-label="${escapeHtml(label)}">`;
  container.dataset.fieldLabel = label;
}

function selectCatalog(index) {
  selectedCatalogIndex = index;
  const item = catalogItems[index];
  $("#selectedPath").textContent = item.path;
  $("#assignedTeam").textContent = item.team;
  $("#subject").value = item.subject;
  $("#description").value = item.description;
  renderDynamicField($("#dynamicFieldOne"), item.fieldOne);
  renderDynamicField($("#dynamicFieldTwo"), item.fieldTwo);
  renderCatalog();
  refreshIcons();
}

function isOpen(ticket) {
  return !["Resuelto", "Cerrado", "Rechazado"].includes(ticket.status);
}

function getVisibleTickets() {
  const query = ($("#ticketSearch")?.value || "").trim().toLowerCase();
  const priority = $("#filterPriority")?.value || "";
  const status = $("#filterStatus")?.value || "";
  return tickets.filter((ticket) => {
    if (activeFilter === "open" && !isOpen(ticket)) return false;
    if (activeFilter === "due" && (!isOpen(ticket) || ticket.slaPaused || ticket.dueHours > 24)) return false;
    if (activeFilter === "unassigned" && ticket.status !== "Sin asignar") return false;
    if (activeFilter === "mine" && !ticket.mine) return false;
    if (priority && ticket.priority !== priority) return false;
    if (status && ticket.status !== status) return false;
    const haystack = `${ticket.id} ${ticket.title} ${ticket.category} ${ticket.requester}`.toLowerCase();
    return !query || haystack.includes(query);
  });
}

function slaLabel(ticket) {
  if (ticket.slaPaused) return "SLA pausado";
  if (!isOpen(ticket)) return "Finalizado";
  return `${ticket.dueHours}h restantes`;
}

function renderMetrics() {
  $("#metricOpen").textContent = tickets.filter(isOpen).length;
  $("#metricDue").textContent = tickets.filter((ticket) => isOpen(ticket) && !ticket.slaPaused && ticket.dueHours <= 24).length;
  $("#metricUnassigned").textContent = tickets.filter((ticket) => ticket.status === "Sin asignar").length;
  $$(".metric-card").forEach((card) => card.classList.toggle("active", card.dataset.metric === activeFilter));
}

function renderTickets() {
  const visible = getVisibleTickets();
  const labels = { open: "Solicitudes no solucionadas", due: "Solicitudes que vencen hoy", unassigned: "Solicitudes sin asignar", mine: "Mis solicitudes" };
  $("#inboxTitle").textContent = labels[activeFilter] || labels.open;
  $("#ticketList").innerHTML = visible.length ? visible.map((ticket) => `
    <div class="ticket-row ${ticket.id === selectedTicketId ? "active" : ""}" data-ticket-id="${escapeHtml(ticket.id)}" role="button" tabindex="0" aria-label="Abrir ${escapeHtml(ticket.id)} ${escapeHtml(ticket.title)}">
      <span class="check-cell"><input type="checkbox" aria-label="Seleccionar ${escapeHtml(ticket.id)}"></span>
      <span><strong>${escapeHtml(ticket.title)}</strong><em>${escapeHtml(ticket.requester)}</em></span>
      <span>#${escapeHtml(ticket.id)}</span>
      <span>${escapeHtml(ticket.category)}</span>
      <span class="priority ${escapeHtml(ticket.priority)}">${escapeHtml(ticket.priority)}</span>
      <span class="status-cell">${escapeHtml(ticket.status)}</span>
      <span>${escapeHtml(slaLabel(ticket))}</span>
    </div>
  `).join("") : '<div class="empty-state">No hay solicitudes para este filtro.</div>';

  if (!visible.some((ticket) => ticket.id === selectedTicketId)) selectedTicketId = visible[0]?.id || null;
  renderMetrics();
  if (selectedTicketId) selectTicket(selectedTicketId, false);
  else $(".detail-panel").classList.add("empty-detail");
  refreshIcons();
}

function selectedTicket() {
  return tickets.find((ticket) => ticket.id === selectedTicketId);
}

function selectTicket(id, rerenderList = true) {
  const ticket = tickets.find((item) => item.id === id);
  if (!ticket) return;
  selectedTicketId = id;
  $(".detail-panel").classList.remove("empty-detail");
  $("#detailTitle").textContent = `Ticket #${ticket.id}`;
  $("#detailCategory").textContent = ticket.category;
  $("#detailStatus").textContent = ticket.status;
  $("#detailPriority").textContent = ticket.priority;
  $("#detailSla").textContent = slaLabel(ticket);
  $("#detailTeam").textContent = ticket.team;
  $("#detailWaiting").textContent = ticket.waiting;
  $("#detailOrigin").textContent = ticket.origin;
  $("#detailType").textContent = ticket.type;
  $("#detailRequester").textContent = ticket.requester;
  $("#detailText").textContent = ticket.text;
  $("#detailTime").textContent = ticket.slaPaused ? "SLA pausado. El tiempo no esta corriendo." : `SLA activo: ${ticket.dueHours} horas restantes.`;
  $("#pauseSlaLabel").textContent = ticket.slaPaused ? "Reanudar SLA" : "Pausar SLA";
  $("#detailFields").innerHTML = Object.entries(ticket.fields || {}).map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join("") || "<dd>Sin campos adicionales.</dd>";
  $("#detailTimeline").innerHTML = (ticket.timeline || []).map((entry) => {
    const [time, ...parts] = entry.split("|");
    return `<div><i data-lucide="circle-dot"></i><span><b>${escapeHtml(time)}</b> ${escapeHtml(parts.join("|"))}</span></div>`;
  }).join("");
  if (rerenderList) $$(".ticket-row").forEach((row) => row.classList.toggle("active", row.dataset.ticketId === id));
  refreshIcons();
}

function setTicketFilter(filter) {
  activeFilter = filter;
  $$("[data-ticket-filter]").forEach((button) => button.classList.toggle("active", button.dataset.ticketFilter === filter));
  setView("inbox");
  renderTickets();
}

function setDetailTab(tab) {
  $$("[data-detail-tab]").forEach((button) => {
    const active = button.dataset.detailTab === tab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  $$("[data-tab-panel]").forEach((panel) => panel.classList.toggle("active", panel.dataset.tabPanel === tab));
}

function currentTime() {
  return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function addTimeline(message) {
  const ticket = selectedTicket();
  if (!ticket) return;
  ticket.timeline ||= [];
  ticket.timeline.push(`${currentTime()}|${message}`);
  saveTickets();
  selectTicket(ticket.id);
}

function exportCsv() {
  const rows = [["ID", "Asunto", "Categoria", "Prioridad", "Estado", "SLA", "Solicitante"], ...getVisibleTickets().map((ticket) => [ticket.id, ticket.title, ticket.category, ticket.priority, ticket.status, slaLabel(ticket), ticket.requester])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = "solicitudes-demo.csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Exportacion CSV generada.");
}

function handleAction(action) {
  if (action === "module-requests") setTicketFilter("open");
  if (action === "global-search") {
    setView("inbox");
    $("#ticketSearch").focus();
    showToast("Escribi un ID, asunto, categoria o solicitante.");
  }
  if (action === "notifications") showToast("No hay notificaciones nuevas en esta demo.");
  if (action === "profile") showToast("Sesion demo: agustin@empresa.com");
  if (action === "attach") $("#attachmentInput").click();
  if (action === "refresh") {
    renderTickets();
    showToast("Bandeja actualizada.");
  }
  if (action === "toggle-filters") $("#filterPanel").hidden = !$("#filterPanel").hidden;
  if (action === "clear-filters") {
    $("#filterPriority").value = "";
    $("#filterStatus").value = "";
    $("#ticketSearch").value = "";
    renderTickets();
  }
  if (action === "export") exportCsv();
  if (action === "internal-note" || action === "send-reply") {
    const text = $("#replyText").value.trim();
    if (!text) return showToast("Escribi un mensaje antes de enviarlo.");
    addTimeline(`${action === "internal-note" ? "Nota interna" : "Respuesta al solicitante"}: ${text}`);
    $("#replyText").value = "";
    showToast(action === "internal-note" ? "Nota interna agregada." : "Respuesta enviada en la demo.");
  }
  if (action === "reassign") {
    const ticket = selectedTicket();
    if (!ticket) return;
    const index = teamRotation.indexOf(ticket.team);
    ticket.team = teamRotation[(index + 1) % teamRotation.length];
    ticket.status = "Asignado";
    ticket.waiting = "Agente";
    addTimeline(`Reasignado a ${ticket.team}`);
    renderTickets();
    showToast(`Asignado a ${ticket.team}.`);
  }
  if (action === "pause-sla") {
    const ticket = selectedTicket();
    if (!ticket) return;
    ticket.slaPaused = !ticket.slaPaused;
    addTimeline(ticket.slaPaused ? "SLA pausado" : "SLA reanudado");
    renderTickets();
    showToast(ticket.slaPaused ? "SLA pausado." : "SLA reanudado.");
  }
  if (action === "resolve") {
    const ticket = selectedTicket();
    if (!ticket) return;
    ticket.status = "Resuelto";
    ticket.waiting = "Nadie";
    addTimeline("Solicitud resuelta");
    renderTickets();
    showToast("Solicitud marcada como resuelta.");
  }
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav-item");
  if (nav) {
    event.preventDefault();
    setView(nav.dataset.view);
  }

  const metric = event.target.closest("[data-metric]");
  if (metric) {
    if (metric.dataset.metric === "sla") setView("reports");
    else setTicketFilter(metric.dataset.metric);
  }

  const catalogButton = event.target.closest("#catalog button");
  if (catalogButton) selectCatalog(Number(catalogButton.dataset.index));

  const filterButton = event.target.closest("[data-ticket-filter]");
  if (filterButton) setTicketFilter(filterButton.dataset.ticketFilter);

  const row = event.target.closest(".ticket-row");
  if (row && !event.target.matches('input[type="checkbox"]')) selectTicket(row.dataset.ticketId);

  const detailTab = event.target.closest("[data-detail-tab]");
  if (detailTab) setDetailTab(detailTab.dataset.detailTab);

  const action = event.target.closest("[data-action]");
  if (action) handleAction(action.dataset.action);
});

document.addEventListener("keydown", (event) => {
  const row = event.target.closest(".ticket-row");
  if (row && ["Enter", " "].includes(event.key)) {
    event.preventDefault();
    selectTicket(row.dataset.ticketId);
  }
});

$("#ticketSearch").addEventListener("input", renderTickets);
$("#filterPriority").addEventListener("change", renderTickets);
$("#filterStatus").addEventListener("change", renderTickets);
$("#attachmentInput").addEventListener("change", (event) => {
  $("#attachmentName").textContent = event.target.files[0]?.name || "";
});

$("#ticketForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const numbers = tickets.map((ticket) => Number(ticket.id.replace(/\D/g, ""))).filter(Number.isFinite);
  const priority = $("#priority").value;
  const item = catalogItems[selectedCatalogIndex];
  const dynamicFields = {};
  [$("#dynamicFieldOne"), $("#dynamicFieldTwo")].forEach((label) => {
    dynamicFields[label.dataset.fieldLabel] = label.querySelector("input")?.value || "";
  });
  const newTicket = {
    id: `SC-${Math.max(1048, ...numbers) + 1}`,
    title: $("#subject").value.trim(),
    category: $("#selectedPath").textContent,
    priority,
    status: "Asignado",
    dueHours: slaHours[priority],
    team: item.team,
    waiting: "Agente",
    requester: $("#requester").value.trim(),
    origin: $("#origin").value,
    type: $("#requestType").value,
    mine: false,
    text: $("#description").value.trim(),
    fields: dynamicFields,
    attachment: $("#attachmentInput").files[0]?.name || "",
    timeline: [`${currentTime()}|Ticket creado desde portal web`, `${currentTime()}|Asignado automaticamente a ${item.team}`]
  };
  tickets.unshift(newTicket);
  selectedTicketId = newTicket.id;
  activeFilter = "open";
  saveTickets();
  $("#attachmentInput").value = "";
  $("#attachmentName").textContent = "";
  setView("inbox");
  renderTickets();
  showToast(`Ticket ${newTicket.id} creado y asignado.`);
});

window.addEventListener("hashchange", () => setView(location.hash.slice(1), false));

renderCatalog();
selectCatalog(0);
renderMetrics();
renderTickets();
setDetailTab("conversation");
setView(location.hash.slice(1) || "portal", false);
refreshIcons();
