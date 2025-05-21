import { useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGame } from './contexts/GameContext';
import { getBotMove, saveGame } from './services/api';
import { Chess } from 'chess.js';

export default function ChessBoardWrapper() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.game.turn() === 'b' && !state.isBotThinking && !state.gameResult) {
      handleBotMove();
    }
    // eslint-disable-next-line
  }, [state.game.turn()]);

  const handleBotMove = async () => {
    try {
      dispatch({ type: 'BOT_THINKING_START' });
      const botMove = await getBotMove(state.game.fen());
      dispatch({ type: 'MAKE_MOVE', move: botMove.move }); // UCI
      // Check for game end
      if (state.game.isGameOver()) {
        const result = state.game.isCheckmate() 
          ? (state.game.turn() === 'w' ? 'black' : 'white')
          : 'draw';
        dispatch({ type: 'UPDATE_GAME_RESULT', result });
        await saveGame({
          moves: state.gameHistory,
          result,
          fen: state.game.fen(),
        });
      }
    } catch (error) {
      console.error('Error getting bot move:', error);
    } finally {
      dispatch({ type: 'BOT_THINKING_END' });
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    console.log('Attempting move from', sourceSquare, 'to', targetSquare);
    console.log('Current FEN:', state.game.fen());
    
    try {
      // Get all legal moves
      const legalMoves = state.game.moves({ verbose: true });
      console.log('Legal moves:', legalMoves);

      // Check if the move is legal
      const isLegalMove = legalMoves.some(
        move => move.from === sourceSquare && move.to === targetSquare
      );

      if (!isLegalMove) {
        console.log('Move is not legal');
        return false;
      }

      // Create a temporary game to make the move
      const tempGame = new Chess(state.game.fen());
      const move = tempGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (!move) {
        console.log('Failed to make move');
        return false;
      }

      console.log('Valid move:', move);
      // Create UCI format move string
      const uciMove = move.from + move.to + (move.promotion || '');
      dispatch({ type: 'MAKE_MOVE', move: uciMove });
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      return false;
    }
  };

  return (
    <div className="chessboard-container">
      <Chessboard
        position={state.game.fen()}
        onPieceDrop={onDrop}
        boardWidth={600}
        arePiecesDraggable={!state.isBotThinking && state.game.turn() === 'w'}
      />
    </div>
  );
}
