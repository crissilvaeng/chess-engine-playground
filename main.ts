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

interface Outcome {
  inCheckmate: boolean
  inStalemate: boolean
  inDraw: boolean
  insufficientMaterial: boolean
  inThreefoldRepetition: boolean
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
    return {
      inCheckmate: this.chess.in_checkmate(),
      inStalemate: this.chess.in_stalemate(),
      inDraw: this.chess.in_draw(),
      insufficientMaterial: this.chess.insufficient_material(),
      inThreefoldRepetition: this.chess.in_threefold_repetition()
    }
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
