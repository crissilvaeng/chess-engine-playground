import { Chess, ChessInstance } from 'chess.js'
import { Engine } from 'node-uci'

class GameLogger {
  log(chess: ChessInstance) {
    console.log(chess.ascii())
    console.log(chess.fen())
  }
}

class ChessEngine {
  constructor(private readonly engine: Engine) {}

  static async create(path: string) {
    const engine = new Engine(path)
    await engine.init()
    await engine.isready()
    return new ChessEngine(engine)
  }

  async move(fen: string, movetime: number): Promise<string> {
    await this.engine.position(fen)
    const { bestmove } = await this.engine.go({ movetime })
    return bestmove
  }
}

enum Color {
  White = 'White',
  Black = 'Black'
}

enum Termination {
  Checkmate = 'Checkmate',
  Stalemate = 'Stalemate',
  InsufficientMaterial = 'InsufficientMaterial',
  ThreefoldRepetition = 'ThreefoldRepetition',
  FiftyMoves = 'FiftyMoves',
}

interface Outcome {
  termination: Termination,
  winner?: Color
  result: string
}

class Game {
  constructor(
    private readonly chess: ChessInstance,
    private readonly players: Array<ChessEngine>,
    private readonly logger: GameLogger) {}

  async run(): Promise<Outcome> {
    this.logger.log(this.chess)
    while(!this.chess.game_over()) {
      const player = this.player()
      const move = await player.move(this.chess.fen(), 15)
      this.chess.move(move, { sloppy: true })
      this.logger.log(this.chess)
    }
    return this.outcome()
  }

  private player(): ChessEngine {
    const player = this.players.shift()
    this.players.push(player)
    return player
  }

  private outcome(): Outcome {
    const termination = this.getTermination()
    const winner = this.getWinner()
    const result = this.getResult(winner)
    return { termination, winner, result }
  }

  private getTermination(): Termination {
    if (this.chess.in_checkmate()) return Termination.Checkmate
    if (this.chess.in_stalemate()) return Termination.Stalemate
    if (this.chess.insufficient_material()) return Termination.InsufficientMaterial
    if (this.chess.in_threefold_repetition()) return Termination.ThreefoldRepetition
    return Termination.FiftyMoves
  }

  private getWinner(): Color | null {
    if (this.chess.game_over() && !this.chess.in_draw()) {
      if (this.chess.turn() === 'b') {
        return Color.White
      }
      if (this.chess.turn() === 'w') {
        return Color.Black
      }
    }
  }

  private getResult(winner?: Color): string {
    if (winner === Color.White) return '1-0'
    if (winner === Color.Black) return '0-1'
    return '1/2-1/2'
  }
}

const main = async (white: string, black: string) => {
  const chess = Chess()
  const stockfish = await ChessEngine.create(white)
  const komodo = await ChessEngine.create(black)
  const logger = new GameLogger()
  
  const game = new Game(chess, [stockfish, komodo], logger)
  const outcome = await game.run()
  console.log(outcome)
  process.exit()
}

main('stockfish', 'komodo')
