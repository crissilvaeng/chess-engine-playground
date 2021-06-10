import { Chess, ChessInstance } from 'chess.js'
import { Engine } from 'node-uci'

const play = async (engine: Engine, chess: ChessInstance) => {
  await engine.init()
  await engine.setoption('MultiPV', '4')
  await engine.isready()

  while (!chess.game_over()) {
    await engine.position(chess.fen())
    const { bestmove } = await engine.go({ movetime: 15 })
    console.log(chess.ascii())
    console.log(chess.turn(), chess.fen())
    chess.move(bestmove, { sloppy: true })
  }
  console.log({
    in_checkmate: chess.in_checkmate(),
    in_stalemate: chess.in_stalemate(),
    in_draw: chess.in_draw(),
    insufficient_material: chess.insufficient_material(),
    in_threefold_repetition: chess.in_threefold_repetition()
  })
  return chess
}

const chess = new Chess()
const engine = new Engine('stockfish')

play(engine, chess)
  .then((chess) =>   console.log({
    in_checkmate: chess.in_checkmate(),
    in_stalemate: chess.in_stalemate(),
    in_draw: chess.in_draw(),
    insufficient_material: chess.insufficient_material(),
    in_threefold_repetition: chess.in_threefold_repetition()
  }))
  .finally(() => engine.quit())
