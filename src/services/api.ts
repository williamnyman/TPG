const API_BASE_URL = 'http://localhost:8000';

export interface BotMove {
  move: string;
  evaluation: number;
}

export async function getBotMove(fen: string): Promise<BotMove> {
  const response = await fetch(`${API_BASE_URL}/api/bot/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fen }),
  });

  if (!response.ok) {
    throw new Error('Failed to get bot move');
  }

  return response.json();
}

export async function saveGame(gameData: {
  moves: string[];
  result: string;
  fen: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    throw new Error('Failed to save game');
  }
}

export async function getBotStats(): Promise<{
  gamesPlayed: number;
  winRate: number;
  averageGameLength: number;
}> {
  const response = await fetch(`${API_BASE_URL}/api/bot/stats`);

  if (!response.ok) {
    throw new Error('Failed to get bot stats');
  }

  return response.json();
} 