import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { Chess } from 'chess.js';

interface GameState {
  game: Chess;
  isBotThinking: boolean;
  gameHistory: string[]; // UCI moves
  capturedPieces: { white: string[]; black: string[] };
  gameResult: 'white' | 'black' | 'draw' | null;
}

type GameAction =
  | { type: 'MAKE_MOVE'; move: string } // move is UCI
  | { type: 'BOT_THINKING_START' }
  | { type: 'BOT_THINKING_END' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_GAME_RESULT'; result: 'white' | 'black' | 'draw' };

const initialState: GameState = {
  game: new Chess(),
  isBotThinking: false,
  gameHistory: [],
  capturedPieces: { white: [], black: [] },
  gameResult: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      console.log('Reducer: Making move', action.move);
      console.log('Current FEN:', state.game.fen());
      
      // Create a new game from the current FEN
      const newGame = new Chess(state.game.fen());
      
      // Get all legal moves
      const legalMoves = newGame.moves({ verbose: true });
      console.log('Legal moves:', legalMoves);

      // Extract from and to squares from UCI move
      const from = action.move.slice(0, 2);
      const to = action.move.slice(2, 4);
      const promotion = action.move.length > 4 ? action.move[4] : undefined;

      // Check if the move is legal
      const isLegalMove = legalMoves.some(
        move => move.from === from && move.to === to
      );

      if (!isLegalMove) {
        console.log('Reducer: Move is not legal');
        return state;
      }

      // Try to make the move
      const move = newGame.move({
        from,
        to,
        promotion
      });

      // If move is invalid, return current state
      if (!move) {
        console.log('Reducer: Failed to make move');
        return state;
      }

      console.log('Reducer: Move successful, new FEN:', newGame.fen());
      
      return {
        ...state,
        game: newGame,
        gameHistory: [...state.gameHistory, action.move],
        capturedPieces: {
          white: newGame.history({ verbose: true })
            .filter(move => move.captured && move.color === 'w')
            .map(move => move.captured!),
          black: newGame.history({ verbose: true })
            .filter(move => move.captured && move.color === 'b')
            .map(move => move.captured!),
        },
      };
    }
    case 'BOT_THINKING_START':
      return { ...state, isBotThinking: true };
    case 'BOT_THINKING_END':
      return { ...state, isBotThinking: false };
    case 'RESET_GAME':
      return {
        ...initialState,
        game: new Chess(),
      };
    case 'UPDATE_GAME_RESULT':
      return { ...state, gameResult: action.result };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 