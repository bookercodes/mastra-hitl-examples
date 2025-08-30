import { useEffect, useRef, useState } from 'react'
import { mastraClient } from "./lib/mastra";

interface Message {
  text: string
  author: 'user' | 'assistant'
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [runId, setRunId] = useState('')
  const [gameWon, setGameWon] = useState(false)
  const hasInitialized = useRef(false)

  const addMessage = (text: string, author: 'user' | 'assistant') => {
    setMessages(prevMessages => [...prevMessages, { text, author }])
  }

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true;

    (async () => {
      const gameWorkflow = mastraClient.getWorkflow("gameWorkflow")
      const { runId } = await gameWorkflow.createRunAsync()
      const result = await gameWorkflow.startAsync({
        runId: runId,
        inputData: {}
      })

      setRunId(runId)
      addMessage(result.steps.generateInitialGameState.output.response, 'assistant')
    })()
  }, [])

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    addMessage(inputMessage, 'user')
    setInputMessage('')

    const gameWorkflow = mastraClient.getWorkflow("gameWorkflow")
    const result = await gameWorkflow.resumeAsync({
      runId,
      step: "takeUserTurn",
      resumeData: {
        userGuess: inputMessage
      }
    })

    console.log("result", result)

    if (result.status === "suspended") {
      addMessage(result.steps.takeUserTurn.payload.response, 'assistant')
    } else if (result.status === "success") {
      addMessage(result.steps.endGame.output.response, 'assistant')
      setGameWon(true)
    }
  }

  return (
    <>
      <div>
        <p>Hello</p>
        <div>
          {messages.map((message, index) => (
            <p key={index} style={{
              color: message.author === 'user' ? 'blue' : 'green',
              fontWeight: message.author === 'user' ? 'bold' : 'normal'
            }}>
              {message.author === 'user' ? 'You: ' : 'Assistant: '}{message.text}
            </p>
          ))}
        </div>

        {!gameWon && (
          <form onSubmit={handleSubmitMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button>Send</button>
          </form>
        )}

        {gameWon && (
          <button onClick={() => window.location.reload()}>
            Play Again
          </button>
        )}

      </div>
    </>
  )
}

export default App
