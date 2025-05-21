import { useGame } from './contexts/GameContext';
import { Chess } from 'chess.js';

export default function MovesBox() {
  const { state } = useGame();

  // Reconstruct the game and get SAN moves
  const chess = new Chess();
  const sanMoves: string[] = [];
  for (const uci of state.gameHistory) {
    const move = chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci[4] : undefined });
    if (move) sanMoves.push(move.san);
  }

  return (
    <div className="moves-box">
      <h3>Game History</h3>
      <div className="moves-list">
        {sanMoves.map((move, index) => (
          <div key={index} className="move-item">
            <span className="move-number">{Math.floor(index / 2) + 1}.</span>
            <span className="move-text">{move}</span>
          </div>
        ))}
      </div>
    </div>
  );
}