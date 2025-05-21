from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import chess
from ..models.chess_model import ChessPolicyNetwork, ChessValueNetwork
from ..utils.board_encoder import encode_board, encode_move, decode_move
import torch
import numpy as np

router = APIRouter()

class GameData(BaseModel):
    moves: List[str]
    result: str
    fen: str

class BotMoveRequest(BaseModel):
    fen: str

class BotMoveResponse(BaseModel):
    move: str
    evaluation: float

# Initialize the neural networks
policy_net = ChessPolicyNetwork()
value_net = ChessValueNetwork()

@router.post("/bot/move", response_model=BotMoveResponse)
async def get_bot_move(request: BotMoveRequest):
    try:
        board = chess.Board(request.fen)
        if board.is_game_over():
            raise HTTPException(status_code=400, detail="Game is already over")

        # Convert board to neural network input
        board_input = encode_board(board)
        
        # Get move probabilities from policy network
        with torch.no_grad():
            move_probs = policy_net(board_input)
            position_value = value_net(board_input)

        # Get legal moves
        legal_moves = list(board.legal_moves)
        
        # Find the best legal move based on policy network output
        best_move = None
        best_prob = -float('inf')
        
        for move in legal_moves:
            move_idx = encode_move(move)
            if move_idx < len(move_probs[0]):
                prob = move_probs[0][move_idx].item()
                if prob > best_prob:
                    best_prob = prob
                    best_move = move

        if best_move is None:
            # Fallback to random move if no good move found
            best_move = np.random.choice(legal_moves)

        # Make the move
        board.push(best_move)
        
        return BotMoveResponse(
            move=best_move.uci(),
            evaluation=position_value.item()
        )

    except Exception as e:
        import traceback
        print(f"Error in get_bot_move: {str(e)}")
        print("Traceback:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/games")
async def save_game(game_data: GameData):
    try:
        # TODO: Implement game saving to database
        # For now, just return success
        return {"status": "success", "message": "Game saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bot/stats")
async def get_bot_stats():
    try:
        # TODO: Implement actual stats calculation from database
        # For now, return dummy data
        return {
            "gamesPlayed": 0,
            "winRate": 0.0,
            "averageGameLength": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 