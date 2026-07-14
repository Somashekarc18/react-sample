import { useState, useEffect, useRef } from 'react'
import './SnakeGame.css'

const GRID_SIZE = 20
const INITIAL_SPEED = 100

function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState({ x: 1, y: 0 })
  const [nextDirection, setNextDirection] = useState({ x: 1, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const gameLoopRef = useRef()

  const generateFood = (snakeBody) => {
    let newFood
    let isOnSnake = true
    while (isOnSnake) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
      isOnSnake = snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    }
    return newFood
  }

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setDirection({ x: 1, y: 0 })
    setNextDirection({ x: 1, y: 0 })
    setFood({ x: 15, y: 15 })
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameOver && !isPaused) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault()
            if (direction.y === 0) setNextDirection({ x: 0, y: -1 })
            break
          case 'ArrowDown':
            e.preventDefault()
            if (direction.y === 0) setNextDirection({ x: 0, y: 1 })
            break
          case 'ArrowLeft':
            e.preventDefault()
            if (direction.x === 0) setNextDirection({ x: -1, y: 0 })
            break
          case 'ArrowRight':
            e.preventDefault()
            if (direction.x === 0) setNextDirection({ x: 1, y: 0 })
            break
          default:
            break
        }
      }
      if (e.key === ' ') {
        e.preventDefault()
        setIsPaused((p) => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, isPaused, direction])

  useEffect(() => {
    if (gameOver || isPaused) return

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const newDirection = nextDirection
        setDirection(newDirection)

        const head = prevSnake[0]
        const newHead = {
          x: (head.x + newDirection.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + newDirection.y + GRID_SIZE) % GRID_SIZE,
        }

        // Check collision with self
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        // Check if food eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 1)
          setFood(generateFood(newSnake))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, INITIAL_SPEED)

    return () => clearInterval(gameLoopRef.current)
  }, [gameOver, isPaused, nextDirection, food])

  return (
    <div className="snake-container">
      <div className="snake-header">
        <h1>Snake Game</h1>
        <div className="snake-score">Score: {score}</div>
      </div>

      <div className="snake-board">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE
          const y = Math.floor(i / GRID_SIZE)
          const isSnake = snake.some((segment) => segment.x === x && segment.y === y)
          const isHead = snake[0].x === x && snake[0].y === y
          const isFood = food.x === x && food.y === y

          return (
            <div
              key={i}
              className={`grid-cell ${isSnake ? 'snake' : ''} ${isHead ? 'head' : ''} ${
                isFood ? 'food' : ''
              }`}
            />
          )
        })}
      </div>

      <div className="snake-controls">
        {gameOver && (
          <div className="game-over-message">
            <p>Game Over!</p>
            <p>Final Score: {score}</p>
          </div>
        )}
        {isPaused && !gameOver && <div className="pause-message">Paused</div>}
        <button onClick={resetGame} className="reset-btn">
          {gameOver ? 'Play Again' : 'New Game'}
        </button>
        <button
          onClick={() => setIsPaused((p) => !p)}
          disabled={gameOver}
          className="pause-btn"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="snake-instructions">
        <p>
          <strong>Controls:</strong> Use arrow keys to move | Space to pause/resume
        </p>
        <p>Eat the food to grow and score points. Don't run into yourself!</p>
      </div>
    </div>
  )
}

export default SnakeGame
