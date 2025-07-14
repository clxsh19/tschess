export function moveToArrayIndices(move: number) {
  const from = (move >> 6) & 63;
  const to = move & 63;
  const type = (move >>> 12) & 0xf;
  return {
    from: squareToRowCol(from),
    to: squareToRowCol(to),
    type,
  };
}

export function squareToRowCol(square: number) {
  const row = Math.floor(square / 8); // 0 = top (rank 8)
  const col = square % 8; // 0 = a, 7 = h
  return [row, col]; // matches UI grid
}

export function RowColToSquare(row: number, col: number) {
  return row * 8 + col;
}
