import { useEffect, useRef, useState } from 'react'
import { mastraClient } from './lib/mastra'

interface Message {
  text: string
  author: 'user' | 'assistant'
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [runId, setRunId] = useState('')
  const [gameWonMessage, setGameWonMessage] = useState("")
  const hasInitialized = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const addMessage = (text: string, author: 'user' | 'assistant') => {
    setMessages((prevMessages) => [...prevMessages, { text, author }])
  }

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

      ; (async () => {
        const gameWorkflow = mastraClient.getWorkflow('gameWorkflow')
        const { runId } = await gameWorkflow.createRunAsync()
        const result = await gameWorkflow.startAsync({
          runId,
          inputData: {},
        })

        setRunId(runId)
        addMessage(
          result.steps.generateInitialGameState.output.response,
          'assistant',
        )
      })()
  }, [])

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    addMessage(inputMessage, 'user')
    setInputMessage('')

    const gameWorkflow = mastraClient.getWorkflow('gameWorkflow')
    const result = await gameWorkflow.resumeAsync({
      runId,
      step: 'takeUserTurn',
      resumeData: {
        userGuess: inputMessage,
      },
    })

    console.log('result', result)

    if (result.status === 'suspended') {
      addMessage(result.steps.takeUserTurn.payload.response, 'assistant')
    } else if (result.status === 'success') {
      addMessage(result.steps.endGame.output.response, 'assistant')
      setGameWonMessage(`You won in ${result.steps.endGame.output.guessCount} guesses`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-800">Guessing Game</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.author === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-200'
                }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!gameWonMessage && (
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <form onSubmit={handleSubmitMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your guess..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {gameWonMessage && (
        <div className="bg-white border-t border-gray-200 px-4 py-6">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800 mb-4">{gameWonMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
