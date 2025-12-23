// Configuração - PERSONALIZE AQUI
const config = {
  // Data de início do relacionamento
  startDate: new Date("2025-05-23T22:36:00"),

  // Nomes do casal (opcional)
  names: ["Vitor", "Camila"],
}

// Criar partículas de fundo
function createParticles() {
  const particlesContainer = document.getElementById("particles")
  const particleCount = 50

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"

    const size = Math.random() * 5 + 2
    particle.style.width = size + "px"
    particle.style.height = size + "px"
    particle.style.left = Math.random() * 100 + "%"
    particle.style.top = Math.random() * 100 + "%"
    particle.style.animationDelay = Math.random() * 15 + "s"
    particle.style.animationDuration = Math.random() * 10 + 10 + "s"

    particlesContainer.appendChild(particle)
  }
}

// Atualizar contador de tempo
function updateTimeCounter() {
  const now = new Date()
  const diff = now - config.startDate

  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const counterEl = document.getElementById("timeCounter")
  counterEl.innerHTML = `
        <strong>${months}</strong> meses, 
        <strong>${days}</strong> dias, 
        <strong>${hours}</strong> horas, 
        <strong>${minutes}</strong> minutos e 
        <strong>${seconds}</strong> segundos juntos
    `
}

// Sistema de fogos de artifício
let fireworksInterval
let fireworksAnimationId

function startFireworks() {
  const canvas = document.getElementById("fireworks")
  const ctx = canvas.getContext("2d")

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const fireworks = []
  const particles = []

  class Firework {
    constructor() {
      this.x = Math.random() * canvas.width
      this.y = canvas.height
      this.targetY = Math.random() * canvas.height * 0.5
      this.speed = 3
      this.color = `hsl(${Math.random() * 360}, 100%, 50%)`
    }

    update() {
      this.y -= this.speed
      return this.y <= this.targetY
    }

    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x
      this.y = y
      this.color = color
      this.velocity = {
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 6,
      }
      this.alpha = 1
      this.decay = Math.random() * 0.02 + 0.01
    }

    update() {
      this.velocity.y += 0.1
      this.x += this.velocity.x
      this.y += this.velocity.y
      this.alpha -= this.decay
    }

    draw() {
      ctx.save()
      ctx.globalAlpha = this.alpha
      ctx.beginPath()
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.restore()
    }
  }

  function createParticles(x, y, color) {
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle(x, y, color))
    }
  }

  function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (Math.random() < 0.03) {
      fireworks.push(new Firework())
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].draw()
      if (fireworks[i].update()) {
        createParticles(fireworks[i].x, fireworks[i].y, fireworks[i].color)
        fireworks.splice(i, 1)
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update()
      particles[i].draw()
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1)
      }
    }

    fireworksAnimationId = requestAnimationFrame(animate)
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (fireworksAnimationId) {
    cancelAnimationFrame(fireworksAnimationId)
  }

  animate()
}

// Redimensionar canvas ao mudar tamanho da janela
window.addEventListener("resize", () => {
  const canvas = document.getElementById("fireworks")
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
})

// Navegação entre seções
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn")
  const sections = document.querySelectorAll(".section")

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSection = btn.getAttribute("data-section")

      // Remover active de todos
      navButtons.forEach((b) => b.classList.remove("active"))
      sections.forEach((s) => s.classList.remove("active"))

      // Adicionar active ao clicado
      btn.classList.add("active")
      document.getElementById(targetSection).classList.add("active")

      const canvas = document.getElementById("fireworks")
      const ctx = canvas.getContext("2d")
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (fireworksAnimationId) {
        cancelAnimationFrame(fireworksAnimationId)
      }

      // Se for a seção de ano novo, iniciar fogos
      if (targetSection === "newyear") {
        startFireworks()
      }
    })
  })
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  createParticles()
  updateTimeCounter()
  setInterval(updateTimeCounter, 1000)
  setupNavigation()
})

