import { createWorkflow, createStep } from "@mastra/core/workflows"
import { z } from "zod"
import { gameAgent } from "../agents/game-manager-agent"

const famousPeople = [
  "Taylor Swift",
  "Eminiem",
  "Elon Musk",
  "Steve Jobs",
  "Beyonce",
  "Lionel Messi",
  "Roger Federer",
]

const gameStateSchema = z.object({
  famousPerson: z.string(),
  guessCount: z.number(),
  gameWon: z.boolean(),
  response: z.string(),
})

const generateInitialGameState = createStep({
  id: "generateInitialGameState",
  inputSchema: z.object({}),
  outputSchema: gameStateSchema,
  execute: async () => {
    console.log("generateInitialGameState step executing")
    return {
      famousPerson:
        famousPeople[Math.floor(Math.random() * famousPeople.length)],
      guessCount: 0,
      gameWon: false,
      response:
        "I'm thinking of a famous person. Ask me yes/no questions to figure out who it is!",
    }
  },
})

const playGame = createStep({
  id: "takeUserTurn",
  inputSchema: gameStateSchema,
  resumeSchema: z.object({
    userGuess: z.string(),
  }),
  outputSchema: gameStateSchema,
  execute: async ({ inputData, resumeData, suspend }) => {
    console.log("takeUserTurn step executing")
    // If !resumeData, we're on the first execution of this step OR
    // if gameWon=false, the .dountil() loop restarts this step from
    // the beginning with no resumeData, so we suspend again
    if (!resumeData) {
      console.log("Suspending for user input...")
      return suspend({})
    }
    console.log("Resuming...")

    const { userGuess } = resumeData

    const output = await gameAgent.generate(
      `The famous person is: ${inputData.famousPerson}
       The user guessed: "${userGuess}"
       Respond appropriately. If this is a guess, tell me if it's correct.`,
      {
        output: z.object({
          response: z.string(),
          gameWon: z.boolean(),
        }),
      },
    )
    const { gameWon, response } = output.object

    // Return the updated game state. If gameWon=true, the .dountil()
    // loop will end and this output will be passed to the endGame
    // step. If gameWon=false, the .dountil() loop will restart this
    // step from the beginning, and this output becomes the inputData
    // for the next iteration of this step.
    return {
      famousPerson: inputData.famousPerson,
      guessCount: inputData.guessCount + 1,
      response,
      gameWon
    }
  },
})

const endGame = createStep({
  id: "endGame",
  inputSchema: gameStateSchema,
  outputSchema: gameStateSchema,
  execute: async ({ inputData }) => {
    console.log("The user won 🎉")
    // TODO: something
    return inputData
  },
})

export const gameWorkflow = createWorkflow({
  id: "gameWorkflow",
  inputSchema: z.object({}),
  outputSchema: gameStateSchema,
})
  .then(generateInitialGameState)
  .dountil(playGame, async ({ inputData: { gameWon } }) => gameWon)
  .then(endGame)
  .commit()