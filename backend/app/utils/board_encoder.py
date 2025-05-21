import chess
import numpy as np
import torch

def encode_piece(piece: chess.Piece) -> np.ndarray:
    """Encode a chess piece into a one-hot vector."""
    if piece is None:
        return np.zeros(12)
    
    piece_type = piece.piece_type - 1  # 0-5 for piece types
    color_offset = 0 if piece.color == chess.WHITE else 6
    encoding = np.zeros(12)
    encoding[piece_type + color_offset] = 1
    return encoding

def encode_board(board: chess.Board) -> torch.Tensor:
    """
    Encode a chess board into a neural network input tensor.
    The encoding includes:
    - Piece positions (12 planes for piece types and colors)
    - Castling rights (4 bits)
    - En passant square (1 bit)
    - Side to move (1 bit)
    - Move count (1 value)
    """
    # Initialize the board planes
    board_planes = np.zeros((12, 8, 8))
    
    # Encode piece positions
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece is not None:
            rank, file = chess.square_rank(square), chess.square_file(square)
            piece_encoding = encode_piece(piece)
            board_planes[:, rank, file] = piece_encoding.reshape(12, 1, 1)
    
    # Flatten the board planes
    board_encoding = board_planes.reshape(-1)
    
    # Encode additional game state information
    castling_rights = np.array([
        board.has_castling_rights(chess.WHITE) & chess.BB_H1,
        board.has_castling_rights(chess.WHITE) & chess.BB_A1,
        board.has_castling_rights(chess.BLACK) & chess.BB_H8,
        board.has_castling_rights(chess.BLACK) & chess.BB_A8,
    ], dtype=np.float32)
    
    en_passant = np.array([board.has_legal_en_passant()], dtype=np.float32)
    side_to_move = np.array([board.turn], dtype=np.float32)
    move_count = np.array([board.fullmove_number / 100.0], dtype=np.float32)  # Normalize
    
    # Combine all features
    game_state = np.concatenate([
        board_encoding,
        castling_rights,
        en_passant,
        side_to_move,
        move_count
    ])
    
    return torch.FloatTensor(game_state).unsqueeze(0)

def encode_move(move: chess.Move) -> int:
    """Encode a chess move into a single integer index."""
    from_square = move.from_square
    to_square = move.to_square
    return from_square * 64 + to_square

def decode_move(move_idx: int) -> chess.Move:
    """Decode a move index back into a chess move."""
    from_square = move_idx // 64
    to_square = move_idx % 64
    return chess.Move(from_square, to_square) 