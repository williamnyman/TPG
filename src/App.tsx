import ChessboardWrapper from './ChessBoardWrapper';
import BotStatsBox from './BotStatsBox';
import GameInfoBox from './GameInfoBox';
import ChartBox from './ChartBox'
import './App.css';
import WilliamInfo from './WilliamInfo';
import MovesBox from './MovesBox';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <GameProvider>
      <div className="app-outer-container">
        <h1 className="main-title">The People's Grandmaster</h1>
        <div className="main-content-row">
          <div className="side-column">
            <BotStatsBox />
            <ChartBox />
            <WilliamInfo />
          </div>

          <ChessboardWrapper />

          <div className="side-column">
            <GameInfoBox />
            <MovesBox />
            
            <div className="stats-box">
              <div className="stats-title">Pieces Captured:</div>
            </div>
          </div>
        </div>
      </div>
    </GameProvider>
  );
}

export default App;