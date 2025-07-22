// Constantes do jogo
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 30

// Mensagens românticas
const ROMANTIC_MESSAGES = [
  "💕 Você ilumina meu mundo!",
  "🌹 Cada momento contigo é especial",
  "💖 Meu coração bate mais forte por você",
  "✨ Você é minha estrela mais brilhante",
  "🦋 Com você, tudo fica mais bonito",
  "💝 Você é o presente mais lindo da vida",
  "🌸 Seu sorriso é minha felicidade",
  "💫 Juntos somos infinito",
  "🎀 Você é minha pessoa favorita",
  "💐 Obrigado por existir na minha vida",
]

// Definição das peças (tetrominos)
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "#ff69b4",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ff1493",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#dc143c",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#ff6347",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#ff4500",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#ff0080",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#e91e63",
  },
}

// Variáveis do jogo
let board = []
let currentPiece = null
let nextPiece = null
let score = 0
let lines = 0
let level = 1
let gameOver = false
let isPaused = false
let isPlaying = false
let gameLoop = null

// Canvas elements
let gameCanvas, nextCanvas, gameCtx, nextCtx

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  gameCanvas = document.getElementById("game-board")
  nextCanvas = document.getElementById("next-piece")
  gameCtx = gameCanvas.getContext("2d")
  nextCtx = nextCanvas.getContext("2d")

  initializeBoard()
  setupEventListeners()

  // Melhorias para mobile
  if (isMobile()) {
    setupTouchControls()
    adjustCanvasForMobile()
    enhanceButtonFeedback()
    preventZoom()

    // Mostrar dica de swipe
    setTimeout(() => {
      if (isMobile() && !isPlaying) {
        showMobileHint()
      }
    }, 2000)
  }

  updateDisplay()
})

// Função para voltar ao site principal
function goBack() {
  // Tentar diferentes caminhos possíveis
  const possiblePaths = [
    "../index.html", // Se estiver na pasta tetris
    "../", // Pasta pai
    "/", // Raiz do site
    "../../index.html", // Dois níveis acima
    window.history.length > 1 ? "back" : "../", // Usar histórico se disponível
  ]

  // Se há histórico, usar o botão voltar do navegador
  if (window.history.length > 1) {
    window.history.back()
  } else {
    // Caso contrário, tentar ir para a pasta pai
    window.location.href = "../"
  }
}

// Inicializar tabuleiro vazio
function initializeBoard() {
  board = []
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    board[y] = []
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[y][x] = null
    }
  }
}

// Configurar event listeners
function setupEventListeners() {
  document.addEventListener("keydown", handleKeyPress)

  // Prevenir scroll com as setas
  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault()
    }
  })
}

// Criar peça aleatória
function createRandomPiece() {
  const types = Object.keys(TETROMINOS)
  const randomType = types[Math.floor(Math.random() * types.length)]
  const tetromino = TETROMINOS[randomType]

  const pieceWidth = tetromino.shape[0].length
  const startX = Math.max(0, Math.min(BOARD_WIDTH - pieceWidth, Math.floor((BOARD_WIDTH - pieceWidth) / 2)))

  return {
    shape: tetromino.shape.map((row) => [...row]),
    color: tetromino.color,
    x: startX,
    y: 0,
    type: randomType,
  }
}

// Rotacionar peça
function rotatePieceShape(piece) {
  const rotated = piece.shape[0].map((_, index) => piece.shape.map((row) => row[index]).reverse())
  return {
    ...piece,
    shape: rotated,
  }
}

// Verificar se posição é válida
function isValidPosition(piece, offsetX = 0, offsetY = 0) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + offsetX
        const newY = piece.y + y + offsetY

        // Verificar limites horizontais
        if (newX < 0 || newX >= BOARD_WIDTH) {
          return false
        }

        // Verificar limite inferior
        if (newY >= BOARD_HEIGHT) {
          return false
        }

        // Verificar colisão com peças existentes
        if (newY >= 0 && board[newY][newX] !== null) {
          return false
        }
      }
    }
  }
  return true
}

// Colocar peça no tabuleiro
function placePiece(piece) {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y
        const boardX = piece.x + x

        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          board[boardY][boardX] = piece.color
        }
      }
    }
  }
}

// Limpar linhas completas
function clearLines() {
  let linesCleared = 0

  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell !== null)) {
      board.splice(y, 1)
      board.unshift(new Array(BOARD_WIDTH).fill(null))
      linesCleared++
      y++ // Verificar a mesma linha novamente
    }
  }

  if (linesCleared > 0) {
    lines += linesCleared
    score += linesCleared * 100 * level
    level = Math.floor(lines / 10) + 1
    showRomanticMessage()
    updateDisplay()
  }

  return linesCleared
}

// Mostrar mensagem romântica
function showRomanticMessage() {
  const messageElement = document.getElementById("romantic-message")
  const messageText = document.getElementById("message-text")

  const randomMessage = ROMANTIC_MESSAGES[Math.floor(Math.random() * ROMANTIC_MESSAGES.length)]
  messageText.textContent = randomMessage

  messageElement.classList.remove("hidden")

  setTimeout(() => {
    messageElement.classList.add("hidden")
  }, 3000)
}

// Mover peça
function movePiece(direction) {
  if (!currentPiece || isPaused || gameOver || !isPlaying) return

  let offsetX = 0,
    offsetY = 0

  switch (direction) {
    case "left":
      offsetX = -1
      break
    case "right":
      offsetX = 1
      break
    case "down":
      offsetY = 1
      break
  }

  if (isValidPosition(currentPiece, offsetX, offsetY)) {
    currentPiece.x += offsetX
    currentPiece.y += offsetY
    draw()
  } else if (direction === "down") {
    // Peça chegou ao fundo
    placePiece(currentPiece)
    clearLines()

    // Próxima peça
    currentPiece = nextPiece
    nextPiece = createRandomPiece()

    // Verificar game over
    if (!isValidPosition(currentPiece)) {
      endGame()
    }

    draw()
  }
}

// Rotacionar peça
function rotatePiece() {
  if (!currentPiece || isPaused || gameOver || !isPlaying) return

  const rotated = rotatePieceShape(currentPiece)

  // Tentar rotacionar na posição atual
  if (isValidPosition(rotated)) {
    currentPiece = rotated
    draw()
    return
  }

  // Wall kicks - tentar ajustar posição
  const kicks = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
  ]

  for (const kick of kicks) {
    const adjustedPiece = {
      ...rotated,
      x: rotated.x + kick.x,
      y: rotated.y + kick.y,
    }

    if (isValidPosition(adjustedPiece)) {
      currentPiece = adjustedPiece
      draw()
      return
    }
  }
}

// Queda automática da peça
function dropPiece() {
  if (!currentPiece || isPaused || gameOver) return

  movePiece("down")
}

// Controles do teclado
function handleKeyPress(e) {
  if (!isPlaying || isPaused || gameOver) return

  switch (e.code) {
    case "ArrowLeft":
      movePiece("left")
      break
    case "ArrowRight":
      movePiece("right")
      break
    case "ArrowDown":
      movePiece("down")
      break
    case "ArrowUp":
    case "Space":
      rotatePiece()
      break
    case "KeyP":
      togglePause()
      break
  }
}

// Iniciar jogo
function startGame() {
  initializeBoard()
  currentPiece = createRandomPiece()
  nextPiece = createRandomPiece()
  score = 0
  lines = 0
  level = 1
  gameOver = false
  isPaused = false
  isPlaying = true

  updateDisplay()
  updateButtons()
  hideGameOver()

  // Iniciar loop do jogo
  if (gameLoop) clearInterval(gameLoop)
  gameLoop = setInterval(dropPiece, Math.max(50, 800 - (level - 1) * 50))

  draw()
}

// Pausar/despausar jogo
function togglePause() {
  if (!isPlaying || gameOver) return

  isPaused = !isPaused
  updateButtons()

  if (isPaused) {
    if (gameLoop) clearInterval(gameLoop)
  } else {
    gameLoop = setInterval(dropPiece, Math.max(50, 800 - (level - 1) * 50))
  }
}

// Alternar entre iniciar e pausar
function toggleGame() {
  if (!isPlaying) {
    startGame()
  } else {
    togglePause()
  }
}

// Terminar jogo
function endGame() {
  gameOver = true
  isPlaying = false

  if (gameLoop) {
    clearInterval(gameLoop)
    gameLoop = null
  }

  updateButtons()
  showGameOver()
}

// Mostrar tela de game over
function showGameOver() {
  document.getElementById("final-score").textContent = score
  document.getElementById("final-lines").textContent = lines
  document.getElementById("final-level").textContent = level
  document.getElementById("game-over-overlay").classList.remove("hidden")
}

// Esconder tela de game over
function hideGameOver() {
  document.getElementById("game-over-overlay").classList.add("hidden")
}

// Atualizar botões
function updateButtons() {
  const startPauseBtn = document.getElementById("start-pause-btn")
  const controlBtns = document.querySelectorAll(".btn-control")

  if (!isPlaying) {
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Começar Jogo'
    controlBtns.forEach((btn) => (btn.disabled = true))
  } else if (isPaused) {
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Continuar'
    controlBtns.forEach((btn) => (btn.disabled = true))
  } else {
    startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar'
    controlBtns.forEach((btn) => (btn.disabled = false))
  }
}

// Atualizar display de pontuação
function updateDisplay() {
  document.getElementById("score").textContent = score
  document.getElementById("lines").textContent = lines
  document.getElementById("level").textContent = level

  // Atualizar velocidade do jogo
  if (gameLoop && isPlaying && !isPaused) {
    clearInterval(gameLoop)
    gameLoop = setInterval(dropPiece, Math.max(50, 800 - (level - 1) * 50))
  }
}

// Desenhar coração
function drawHeart(ctx, x, y, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()

  const centerX = x + size / 2
  const centerY = y + size / 2
  const heartSize = size * 0.6

  // Desenhar coração simplificado
  ctx.arc(centerX - heartSize / 4, centerY - heartSize / 4, heartSize / 4, 0, Math.PI * 2)
  ctx.arc(centerX + heartSize / 4, centerY - heartSize / 4, heartSize / 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(centerX, centerY + heartSize / 3)
  ctx.lineTo(centerX - heartSize / 2, centerY - heartSize / 6)
  ctx.lineTo(centerX + heartSize / 2, centerY - heartSize / 6)
  ctx.closePath()
  ctx.fill()
}

// Desenhar tabuleiro
function draw() {
  // Limpar canvas
  gameCtx.fillStyle = "#fce4ec"
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height)

  // Desenhar grade
  gameCtx.strokeStyle = "#f8bbd9"
  gameCtx.lineWidth = 1

  for (let x = 0; x <= BOARD_WIDTH; x++) {
    gameCtx.beginPath()
    gameCtx.moveTo(x * CELL_SIZE, 0)
    gameCtx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)
    gameCtx.stroke()
  }

  for (let y = 0; y <= BOARD_HEIGHT; y++) {
    gameCtx.beginPath()
    gameCtx.moveTo(0, y * CELL_SIZE)
    gameCtx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE)
    gameCtx.stroke()
  }

  // Desenhar peças fixas no tabuleiro
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x]) {
        drawHeart(gameCtx, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, board[y][x])
      }
    }
  }

  // Desenhar peça atual
  if (currentPiece) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const drawX = (currentPiece.x + x) * CELL_SIZE
          const drawY = (currentPiece.y + y) * CELL_SIZE

          if (currentPiece.y + y >= 0) {
            drawHeart(gameCtx, drawX, drawY, CELL_SIZE, currentPiece.color)
          }
        }
      }
    }
  }

  // Desenhar próxima peça
  drawNextPiece()
}

// Desenhar próxima peça
function drawNextPiece() {
  // Limpar canvas da próxima peça
  nextCtx.fillStyle = "#fce4ec"
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height)

  if (!nextPiece) return

  const pieceWidth = nextPiece.shape[0].length
  const pieceHeight = nextPiece.shape.length
  const cellSize = 20

  const offsetX = (nextCanvas.width - pieceWidth * cellSize) / 2
  const offsetY = (nextCanvas.height - pieceHeight * cellSize) / 2

  for (let y = 0; y < nextPiece.shape.length; y++) {
    for (let x = 0; x < nextPiece.shape[y].length; x++) {
      if (nextPiece.shape[y][x]) {
        const drawX = offsetX + x * cellSize
        const drawY = offsetY + y * cellSize
        drawHeart(nextCtx, drawX, drawY, cellSize, nextPiece.color)
      }
    }
  }
}

// Inicializar display
updateDisplay()
updateButtons()
draw()

// Melhorias para mobile
let touchStartX = 0
let touchStartY = 0
let touchEndX = 0
let touchEndY = 0

// Adicionar controles por swipe
function setupTouchControls() {
  gameCanvas.addEventListener("touchstart", handleTouchStart, { passive: false })
  gameCanvas.addEventListener("touchmove", handleTouchMove, { passive: false })
  gameCanvas.addEventListener("touchend", handleTouchEnd, { passive: false })
}

function handleTouchStart(e) {
  e.preventDefault()
  const touch = e.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function handleTouchMove(e) {
  e.preventDefault() // Prevenir scroll
}

function handleTouchEnd(e) {
  e.preventDefault()
  if (!e.changedTouches) return

  const touch = e.changedTouches[0]
  touchEndX = touch.clientX
  touchEndY = touch.clientY

  handleSwipe()
}

function handleSwipe() {
  if (!isPlaying || isPaused || gameOver) return

  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  const minSwipeDistance = 30

  // Determinar direção do swipe
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Swipe horizontal
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        movePiece("right")
      } else {
        movePiece("left")
      }
    }
  } else {
    // Swipe vertical
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        movePiece("down")
      } else {
        rotatePiece() // Swipe para cima = girar
      }
    }
  }
}

// Detectar se é mobile
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Ajustar canvas para mobile
function adjustCanvasForMobile() {
  if (isMobile()) {
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    if (screenWidth < 480) {
      gameCanvas.width = 280
      gameCanvas.height = 560
      nextCanvas.width = 100
      nextCanvas.height = 100
    } else if (screenWidth < 768) {
      gameCanvas.width = 300
      gameCanvas.height = 600
      nextCanvas.width = 120
      nextCanvas.height = 120
    }

    // Recalcular tamanho das células
    const newCellSize = gameCanvas.width / BOARD_WIDTH
    if (newCellSize !== CELL_SIZE) {
      // Atualizar constante se necessário
      window.CELL_SIZE = newCellSize
    }
  }
}

// Adicionar vibração para feedback (se suportado)
function vibrate(duration = 50) {
  if (navigator.vibrate && isMobile()) {
    navigator.vibrate(duration)
  }
}

// Melhorar feedback dos botões
function enhanceButtonFeedback() {
  const controlButtons = document.querySelectorAll(".btn-control")

  controlButtons.forEach((button) => {
    button.addEventListener("touchstart", () => {
      vibrate(30)
      button.style.transform = "scale(0.95)"
    })

    button.addEventListener("touchend", () => {
      setTimeout(() => {
        button.style.transform = "scale(1)"
      }, 100)
    })
  })
}

// Prevenir zoom no double tap
function preventZoom() {
  let lastTouchEnd = 0
  document.addEventListener(
    "touchend",
    (event) => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false,
  )
}

// Mostrar dica para mobile
function showMobileHint() {
  const messageElement = document.getElementById("romantic-message")
  const messageText = document.getElementById("message-text")

  messageText.textContent = "💡 Dica: Deslize na tela para mover as peças! ↕️↔️"
  messageElement.classList.remove("hidden")

  setTimeout(() => {
    messageElement.classList.add("hidden")
  }, 4000)
}

// Atualizar função de movimento para incluir vibração
const originalMovePiece = movePiece
movePiece = (direction) => {
  if (isMobile()) {
    vibrate(20) // Vibração leve para feedback
  }
  return originalMovePiece(direction)
}

// Atualizar função de rotação para incluir vibração
const originalRotatePiece = rotatePiece
rotatePiece = () => {
  if (isMobile()) {
    vibrate(30) // Vibração um pouco mais forte para rotação
  }
  return originalRotatePiece()
}
