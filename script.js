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

const tickets = [
  {
    id: "SC-1048",
    title: "Reposicion de carteleria interior",
    category: "Marketing / Imagen interior / Carteleria",
    priority: "Alta",
    status: "En curso",
    sla: "8h restantes",
    team: "Marketing",
    waiting: "Agente",
    text: "Sucursal solicita reposicion de carteleria interior para nueva campania. Adjunta fotos del sector."
  },
  {
    id: "SC-1047",
    title: "Alta de usuario para nuevo ingreso",
    category: "Tecnologia / Sistemas / Accesos",
    priority: "Media",
    status: "Asignado",
    sla: "31h restantes",
    team: "Tecnologia Nivel 1",
    waiting: "Agente",
    text: "Nuevo ingreso requiere correo, Teams y permisos basicos para sistema de gestion."
  },
  {
    id: "SC-1046",
    title: "Diferencia de precio contra POS",
    category: "Negocios / Precios",
    priority: "Alta",
    status: "Sin asignar",
    sla: "3h restantes",
    team: "Negocios",
    waiting: "Coordinador",
    text: "Sucursal informa diferencia entre precio publicado y precio en caja."
  },
  {
    id: "SC-1045",
    title: "Operacion duplicada en tarjeta",
    category: "Tarjetas / Medios de pago",
    priority: "Critica",
    status: "Esperando tercero",
    sla: "1h restante",
    team: "Tarjetas",
    waiting: "Autorizadora",
    text: "Cliente reclama doble impacto de pago. Se requiere validar con autorizadora."
  }
];

const catalog = document.querySelector("#catalog");
const selectedPath = document.querySelector("#selectedPath");
const assignedTeam = document.querySelector("#assignedTeam");
const subject = document.querySelector("#subject");
const description = document.querySelector("#description");
const dynamicFieldOne = document.querySelector("#dynamicFieldOne");
const dynamicFieldTwo = document.querySelector("#dynamicFieldTwo");
const ticketList = document.querySelector("#ticketList");

function renderCatalog() {
  catalog.innerHTML = catalogItems.map((item, index) => `
    <button type="button" class="${index === 0 ? "active" : ""}" data-index="${index}">
      <strong>${item.area}</strong>
      <span>${item.summary}</span>
    </button>
  `).join("");
}

function renderDynamicField(container, config) {
  const [label, type, value] = config;
  container.innerHTML = `${label}<input type="${type}" value="${value}" aria-label="${label}">`;
}

function selectCatalog(index) {
  const item = catalogItems[index];
  selectedPath.textContent = item.path;
  assignedTeam.textContent = item.team;
  subject.value = item.subject;
  description.value = item.description;
  renderDynamicField(dynamicFieldOne, item.fieldOne);
  renderDynamicField(dynamicFieldTwo, item.fieldTwo);
  document.querySelectorAll(".catalog button").forEach((button) => button.classList.remove("active"));
  document.querySelector(`.catalog button[data-index="${index}"]`).classList.add("active");
}

function renderTickets() {
  ticketList.innerHTML = tickets.map((ticket, index) => `
    <button type="button" class="ticket-row ${index === 0 ? "active" : ""}" data-index="${index}">
      <span>
        <strong>#${ticket.id} - ${ticket.title}</strong>
        <p>${ticket.category}</p>
      </span>
      <span class="ticket-meta">
        <span class="priority ${ticket.priority}">${ticket.priority}</span>
        <small>${ticket.sla}</small>
      </span>
    </button>
  `).join("");
}

function selectTicket(index) {
  const ticket = tickets[index];
  document.querySelector("#detailTitle").textContent = `Ticket #${ticket.id}`;
  document.querySelector("#detailCategory").textContent = ticket.category;
  document.querySelector("#detailStatus").textContent = ticket.status;
  document.querySelector("#detailPriority").textContent = ticket.priority;
  document.querySelector("#detailSla").textContent = ticket.sla;
  document.querySelector("#detailTeam").textContent = ticket.team;
  document.querySelector("#detailWaiting").textContent = ticket.waiting;
  document.querySelector("#detailText").textContent = ticket.text;
  document.querySelectorAll(".ticket-row").forEach((button) => button.classList.remove("active"));
  document.querySelector(`.ticket-row[data-index="${index}"]`).classList.add("active");
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest(".nav-item");
  if (nav) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    nav.classList.add("active");
    document.querySelector(`#${nav.dataset.view}`).classList.add("active");
  }

  const catalogButton = event.target.closest(".catalog button");
  if (catalogButton) selectCatalog(Number(catalogButton.dataset.index));

  const ticketButton = event.target.closest(".ticket-row");
  if (ticketButton) selectTicket(Number(ticketButton.dataset.index));
});

document.querySelector("#ticketForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const newTicket = {
    id: `SC-${1049 + tickets.length}`,
    title: subject.value,
    category: selectedPath.textContent,
    priority: document.querySelector("#priority").value,
    status: "Sin asignar",
    sla: "48h restantes",
    team: assignedTeam.textContent,
    waiting: "Coordinador",
    text: description.value
  };
  tickets.unshift(newTicket);
  document.querySelector("#metricOpen").textContent = String(Number(document.querySelector("#metricOpen").textContent) + 1);
  document.querySelector("#metricUnassigned").textContent = String(Number(document.querySelector("#metricUnassigned").textContent) + 1);
  renderTickets();
  document.querySelector('.nav-item[data-view="inbox"]').click();
  selectTicket(0);
});

renderCatalog();
renderTickets();
selectCatalog(0);
selectTicket(0);

if (window.lucide) {
  window.lucide.createIcons();
}
