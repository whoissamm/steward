"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Whimsical loader: 4 tetris pieces falling and rotating.
 * Each piece is an SVG made of unit squares (u = 10 px).
 */
const U = 10; // unit size for tetromino squares

// Simple tetromino definitions (list of [col, row] cells)
const PIECES: Array<{
  cells: [number, number][];
  color: string;
}> = [
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: "var(--amber-400)" }, // I
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: "var(--green-700)" }, // O
  { cells: [[0, 0], [1, 0], [2, 0], [1, 1]], color: "var(--amber-500)" }, // T
  { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "var(--green-600)" }, // S
];

function Piece({ cells, color }: { cells: [number, number][]; color: string }) {
  const maxX = Math.max(...cells.map((c) => c[0])) + 1;
  const maxY = Math.max(...cells.map((c) => c[1])) + 1;
  return (
    <svg
      width={maxX * U}
      height={maxY * U}
      viewBox={`0 0 ${maxX * U} ${maxY * U}`}
      aria-hidden="true"
    >
      {cells.map(([x, y], i) => (
        <rect
          key={i}
          x={x * U}
          y={y * U}
          width={U}
          height={U}
          rx={1.5}
          fill={color}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={0.5}
        />
      ))}
    </svg>
  );
}

export function TetrisLoader() {
  const reduce = useReducedMotion();
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 120, height: 100 }}
      role="status"
      aria-label="Loading"
    >
      {PIECES.map((piece, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: 10 + i * 26, top: reduce ? 30 : -30 }}
          animate={reduce ? { y: 0, rotate: 0 } : { y: [0, 130], rotate: [0, 90, 180, 270, 360] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 2.2, repeat: Infinity, ease: "easeIn", delay: i * 0.35 }
          }
        >
          <Piece cells={piece.cells} color={piece.color} />
        </motion.div>
      ))}
    </div>
  );
}
