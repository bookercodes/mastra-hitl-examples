
import { Mastra } from '@mastra/core/mastra';
import { gameWorkflow } from './workflows/guessing-game-workflow';
import { LibSQLStore } from '@mastra/libsql';

export const mastra = new Mastra({
  workflows: { gameWorkflow },
  storage: new LibSQLStore({
    url: ":memory:"
  }),
});
