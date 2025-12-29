// Storage keys
const PETS_KEY = "petshop_pets"
const SERVICES_KEY = "petshop_services"

// Initialize data
let pets = JSON.parse(localStorage.getItem(PETS_KEY)) || []
let services = JSON.parse(localStorage.getItem(SERVICES_KEY)) || []

// DOM Elements
const petForm = document.getElementById("pet-form")
const serviceForm = document.getElementById("service-form")
const searchPetsInput = document.getElementById("search-pets")
const filterDateInput = document.getElementById("filter-date")
const clearFilterBtn = document.getElementById("clear-filter")

// Tab Navigation
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab

    // Update active tab button
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"))
    btn.classList.add("active")

    // Update active tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.getElementById(tabName).classList.add("active")

    // Refresh lists when viewing them
    if (tabName === "list-pets") {
      renderPetsList()
    } else if (tabName === "list-services") {
      renderServicesList()
    } else if (tabName === "services") {
      updatePetSelect()
    }
  })
})

// Pet Form Submit
petForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const newPet = {
    id: Date.now(),
    name: document.getElementById("pet-name").value.trim(),
    type: document.getElementById("pet-type").value,
    breed: document.getElementById("pet-breed").value.trim(),
    age: document.getElementById("pet-age").value,
    ownerName: document.getElementById("owner-name").value.trim(),
    ownerPhone: document.getElementById("owner-phone").value.trim(),
    registeredAt: new Date().toISOString(),
  }

  pets.push(newPet)
  savePets()
  showToast("Pet cadastrado com sucesso!")
  petForm.reset()
})

// Service Form Submit
serviceForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const petId = Number.parseInt(document.getElementById("service-pet").value)
  const pet = pets.find((p) => p.id === petId)

  if (!pet) {
    showToast("Pet não encontrado!", "error")
    return
  }

  const newService = {
    id: Date.now(),
    petId: petId,
    petName: pet.name,
    ownerName: pet.ownerName,
    serviceType: document.getElementById("service-type").value,
    date: document.getElementById("service-date").value,
    time: document.getElementById("service-time").value,
    notes: document.getElementById("service-notes").value.trim(),
    status: "Agendado",
    createdAt: new Date().toISOString(),
  }

  services.push(newService)
  saveServices()
  showToast("Serviço agendado com sucesso!")
  serviceForm.reset()
})

// Search Pets
searchPetsInput.addEventListener("input", () => {
  renderPetsList(searchPetsInput.value.toLowerCase())
})

// Filter Services
filterDateInput.addEventListener("change", () => {
  renderServicesList(filterDateInput.value)
})

clearFilterBtn.addEventListener("click", () => {
  filterDateInput.value = ""
  renderServicesList()
})

// Render Pets List
function renderPetsList(searchTerm = "") {
  const container = document.getElementById("pets-list")

  let filteredPets = pets
  if (searchTerm) {
    filteredPets = pets.filter(
      (pet) => pet.name.toLowerCase().includes(searchTerm) || pet.ownerName.toLowerCase().includes(searchTerm),
    )
  }

  if (filteredPets.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <h3>🐕 Nenhum pet encontrado</h3>
                <p>${searchTerm ? "Tente buscar por outro termo" : "Cadastre o primeiro pet!"}</p>
            </div>
        `
    return
  }

  container.innerHTML = filteredPets
    .map(
      (pet) => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${pet.name}</div>
                <button class="btn btn-danger" onclick="deletePet(${pet.id})">Excluir</button>
            </div>
            <div class="card-body">
                <p><strong>Tipo:</strong> ${pet.type}</p>
                ${pet.breed ? `<p><strong>Raça:</strong> ${pet.breed}</p>` : ""}
                ${pet.age ? `<p><strong>Idade:</strong> ${pet.age} ano(s)</p>` : ""}
                <p><strong>Dono:</strong> ${pet.ownerName}</p>
                <p><strong>Telefone:</strong> ${pet.ownerPhone}</p>
                <p><strong>Cadastrado em:</strong> ${formatDate(pet.registeredAt)}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

// Render Services List
function renderServicesList(filterDate = "") {
  const container = document.getElementById("services-list")

  let filteredServices = services
  if (filterDate) {
    filteredServices = services.filter((service) => service.date === filterDate)
  }

  // Sort by date and time
  filteredServices.sort((a, b) => {
    const dateA = new Date(a.date + " " + a.time)
    const dateB = new Date(b.date + " " + b.time)
    return dateB - dateA
  })

  if (filteredServices.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <h3>📅 Nenhum agendamento encontrado</h3>
                <p>${filterDate ? "Nenhum agendamento para esta data" : "Agende o primeiro serviço!"}</p>
            </div>
        `
    return
  }

  container.innerHTML = filteredServices
    .map(
      (service) => `
        <div class="card">
            <div class="card-header">
                <div class="card-title">${service.serviceType}</div>
                <button class="btn btn-danger" onclick="deleteService(${service.id})">Excluir</button>
            </div>
            <div class="card-body">
                <p><strong>Pet:</strong> ${service.petName}</p>
                <p><strong>Dono:</strong> ${service.ownerName}</p>
                <p><strong>Data:</strong> ${formatDateBR(service.date)}</p>
                <p><strong>Horário:</strong> ${service.time}</p>
                <p><strong>Status:</strong> ${service.status}</p>
                ${service.notes ? `<p><strong>Observações:</strong> ${service.notes}</p>` : ""}
            </div>
        </div>
    `,
    )
    .join("")
}

// Update Pet Select in Service Form
function updatePetSelect() {
  const select = document.getElementById("service-pet")

  if (pets.length === 0) {
    select.innerHTML = '<option value="">Nenhum pet cadastrado</option>'
    return
  }

  select.innerHTML =
    '<option value="">Selecione um pet...</option>' +
    pets
      .map(
        (pet) => `
            <option value="${pet.id}">${pet.name} - ${pet.ownerName}</option>
        `,
      )
      .join("")
}

// Delete Pet
function deletePet(id) {
  if (!confirm("Tem certeza que deseja excluir este pet?")) return

  pets = pets.filter((pet) => pet.id !== id)
  savePets()
  renderPetsList()
  showToast("Pet excluído com sucesso!")
}

// Delete Service
function deleteService(id) {
  if (!confirm("Tem certeza que deseja excluir este agendamento?")) return

  services = services.filter((service) => service.id !== id)
  saveServices()
  renderServicesList()
  showToast("Agendamento excluído com sucesso!")
}

// Save to LocalStorage
function savePets() {
  localStorage.setItem(PETS_KEY, JSON.stringify(pets))
}

function saveServices() {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services))
}

// Show Toast Notification
function showToast(message, type = "success") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = "toast show"

  if (type === "error") {
    toast.classList.add("error")
  }

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Format Date
function formatDate(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR")
}

function formatDateBR(dateString) {
  const [year, month, day] = dateString.split("-")
  return `${day}/${month}/${year}`
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  renderPetsList()
  updatePetSelect()

  // Set minimum date for service scheduling (today)
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("service-date").setAttribute("min", today)
})
