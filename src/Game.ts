import {BallColors, CSStyles, TBoardPiece, TBoardPosition} from "./Types";
import "./Interfaces";
import "./Utils";
import "./proto"
import {Utils} from "./Utils";
import {ITableCell} from "./Interfaces";

/**
 * Game is the main class of SussyBalls™ containing all of its core logic, save for pathfinding which is located in {@link AStar}
 * @param board Table containing the balls
 * @param chosenElement The selected ball
 * @param parentElement The HTML element (with relevant data) and the color of the ball in the cell
 * @param nextBallId Id of the next created ball, integer counted up from zero
 */
export class Game {
    static BOARD_WIDTH = 9
    static BOARD_HEIGHT = 9
    static NEW_BALLS = 3
    static POINTS_FOR_BALL = 10
    static BALL_LINE_MIN_LENGTH = 3

    board: TBoardPiece[][] = []
    chosenElement: TBoardPiece | null = null
    parentElement: HTMLTableElement
    sideBoard: HTMLTableElement
    sideBoardData: ITableCell[]
    nextBallId = 0
    points: number = 0;

    /**
     * Also creates the board and draws it
     * @param rootElementId The name of the table to be fetched by id, or created and appended to document body
     */
    constructor(rootElementId: string) {
        this.sideBoard = this.newTable("sideBoard")
        this.sideBoardData = Utils.populateBoard(1, Game.NEW_BALLS, this.sideBoard, "previewCell")
        this.parentElement = (document.getElementById(rootElementId) || this.newTable(rootElementId)) as HTMLTableElement
        this.parentElement.innerHTML = ""
        console.log(this.sideBoardData)
        document.createElement("div", {
            id: "pointView",
            style: new CSStyles({
                width: "200px",
                height: "100px",
                position: "absolute",
                top: "0",
                right: "0"
            })
        }).appendTo(document.body)
        this.createBoard()
        this.generateNewBalls()
        this.placeGeneratedBalls()
        this.drawBoard()
        this.generateNewBalls()
    }

    /** @param tableId The name of the table to be created and appended to document body */
    newTable(tableId: string): HTMLTableElement {
        return document.createElement("table", {
            className: "gameBoard",
            id: tableId
        }).appendTo(document.body)
    }

    /** Creates the columns and cells of the board, as well as {@link Game.board}'s data */
    createBoard() {
        for (let i = 0; i < Game.BOARD_HEIGHT; i++) {
            let row: TBoardPiece[] = []
            let htmlRow = document.createElement("tr", {
                id: `${this.parentElement.id}-row-${i}`
            })
            for (let j = 0; j < Game.BOARD_WIDTH; j++) {
                row.push({
                    color: undefined, position: {
                        column: j,
                        row: i
                    },
                    htmlElement: document.createElement("td", {
                        className: "gameCell",
                        id: `${this.parentElement.id}-cell-[${i},${j}]`,
                        onclick: (e) => {
                            e.stopPropagation()
                            console.log(`Cell onclick ${this.parentElement.id}-cell-[${i},${j}]}`)
                            this.cellOnMouseEnter(this.board[i][j])
                            //this.cellOnClick(this.board[i][j])
                            this.drawBoard()
                        },
                        // onmouseenter: (e) => {
                        //     e.stopPropagation()
                        //     console.log(`Cell onmouseenter ${this.parentElement.id}-cell-[${i},${j}]}`)
                        //     this.cellOnMouseEnter(this.board[i][j])
                        //     this.drawBoard()
                        // },
                        // onmouseleave: (e) => {
                        //     e.stopPropagation()
                        //     console.log(`Cell onmouseleave ${this.parentElement.id}-cell-[${i},${j}]}`)
                        //     this.cellOnMouseLeave()
                        //     this.drawBoard()
                        // },
                        storedData: {
                            isClicked: false
                        }
                    }).appendTo(htmlRow),
                    isClicked: false
                })
            }
            this.board.push(row)
            htmlRow.appendTo(this.parentElement)
        }
    }

    /** Redraws the board with the balls inside the {@link Game.board} */
    public drawBoard() {
        for (let row of this.board) {
            for (let cell of row) {
                cell.htmlElement.innerHTML = ""
                if (cell.color !== undefined){
                    document.createElement("div", {
                        className: "ball",
                        onclick: (e) => {
                            e.stopPropagation()
                            console.log(`Ball onclick ${cell.htmlElement.id}`)
                            this.ballOnClick(cell)
                            this.drawBoard()
                        },
                        style: new CSStyles({
                            backgroundColor: Utils.intToHexString(cell.color)
                        })
                    }).appendTo(cell.htmlElement).classList.add("normal")
                }
            }
        }
        let x = document.getElementById("pointView")
        x!.innerText = String(this.points)
    }

    /** Places a ball on the board
     * @param position The cell to place the ball in
     * @param color The color of the ball
     * */
    placeBall(position: TBoardPosition, color: BallColors) {
        this.board[position.row][position.column].color = color
    }

    /** Moves a ball from one position to another
     * @param from The source
     * @param to The destination
     * */
    moveBall(from: TBoardPosition, to: TBoardPosition) {
        this.board[to.row][to.column].color = this.board[from.row][from.column].color
        this.board[from.row][from.column].color = undefined
        this.board[from.row][from.column].ball = undefined
    }

    /** Function handling the onclick event on ball
     * Toggles the ball highlight and sets {@link Game.chosenElement}
     * @param cell The cell which has been clicked
     * */
    ballOnClick(cell: TBoardPiece) {
        if (cell.htmlElement.storedData?.isClicked) {
            Utils.toggleIsClicked(cell)
            this.chosenElement = null
        } else {
            if (!Utils.isSurrounded(this.board, cell)) {
                Utils.toggleIsClicked(cell)
                this.chosenElement = cell
            }
        }
    }

    /** Function handling the onmouseenter event on cell
     * If {@link Game.chosenElement} is not undefined, draws a path from it to the entered cell
     * @param cell The cell which has been entered
     * */
    cellOnMouseEnter(cell: TBoardPiece) {
        if (this.chosenElement) {
            if (cell.color === undefined) {
                let path = Utils.getAStarPathFor(this.board, this.chosenElement, cell)
                console.log(path)
                if (path) {
                    for (const position of path) {
                        this.board[position.row][position.column].htmlElement.innerHTML = `<h1>${path.indexOf(position)}</h1>`
                        Utils.setCellBackground(this.board[position.row][position.column].htmlElement, BallColors.Red)
                    }
                }
            }
        }
    }
    /** Function handling the onmouseleave event on cell
     * If {@link Game.chosenElement} is not undefined, clears all background colors
     * */
    cellOnMouseLeave() {
        if (this.chosenElement) {
            Utils.clearCellBackgroundIn(this.board)
        }
    }

    /** Function handling the onclick event on cell
     * If {@link Game.chosenElement} is not undefined and a path can be found, moves the ball to the clicked cell
     * @param cell The cell which has been clicked
     * */
    cellOnClick(cell: TBoardPiece) {
        if (this.chosenElement) {
            if (Utils.getAStarPathFor(this.board, this.chosenElement, cell)){
                this.moveBall(this.chosenElement.position, cell.position)
                this.chosenElement = null
                Utils.clearCellBackgroundIn(this.board)
                this.checkForLines()
                this.placeGeneratedBalls()
                this.generateNewBalls()
                this.drawBoard()
            }
        }
    }

    /** Generates {@link Game.NEW_BALLS} balls and shows them in {@link Game.sideBoard} */
    private generateNewBalls() {
        for (let cell of this.sideBoardData){
            cell.htmlElement.innerHTML = ""
            cell.color = Utils.randEnumValue(BallColors)
            document.createElement("div", {
                className: "ball",
                style: new CSStyles({
                    backgroundColor: Utils.intToHexString(cell.color)
                })
            }).appendTo(cell.htmlElement).classList.add("clicked")
        }
    }

    /** Places the previously generated balls on the board */
    private placeGeneratedBalls() {
        for (let cell of this.sideBoardData) {
            let emptyCells = Utils.squash2dArray(this.board).filter(cell => cell.color === undefined)
            if (emptyCells.length == 0) {
                this.onGameLost()
            } else {
                let randomCell = emptyCells.random()
                randomCell!.color = cell.color
            }
        }
    }

    /** Checks if all the spaces inside the board have been used up.
     * If so, shows an overlay on top of the page */
    private onGameLost() {
        document.createElement("p", {
            innerText: `You lost!
                You finished the game with ${this.points} points.`,
            style: new CSStyles({
                textAlign: "center"
            })
        }).appendTo(document.createElement("div", {
            className: "losingDiv"
        }).appendTo(document.body))
    }

    /** Checks if there are balls lined up for removal in all four directions.
     * The minimum number of balls needed is {@link Game.BALL_LINE_MIN_LENGTH}
     * For every ball removed adds {@link Game.POINTS_FOR_BALL} points to user's score */
    public checkForLines() {
        let directionalArrays = [
            Utils.iterateVertically(this.board),
            Utils.iterateDiagonallyRight(this.board),
            Utils.iterateDiagonallyLeft(this.board),
            this.board
        ]
        let toBeDeleted = new Set<string>()
        //console.group("Arrays")
        for (let directionalArray of directionalArrays) {
            //console.group("Rows")
            for (let row of directionalArray) {
                //console.log(row)
                //console.group("Cells")
                let currentColor = row[0].color
                //console.log("Start color:", currentColor)
                let currentIDs: string[] = []
                for (let i = 1; i < row.length; i++) {
                    //console.group(`Cell ${i}`)
                    if (row[i].color === currentColor) {
                        currentIDs.push(row[i].htmlElement.id)
                    } else if (currentIDs.length >= Game.BALL_LINE_MIN_LENGTH && currentColor !== undefined) {
                        currentIDs.forEach(ID => toBeDeleted.add(ID))
                        currentIDs = [row[i].htmlElement.id]
                        currentColor = row[i].color
                    } else {
                        currentIDs = [row[i].htmlElement.id]
                        currentColor = row[i].color
                    }
                    //console.log("Current color:", currentColor)
                    //console.log("Current IDs:", currentIDs)
                    //console.groupEnd()
                }
                if (currentIDs.length >= Game.BALL_LINE_MIN_LENGTH && currentColor !== undefined) {
                    currentIDs.forEach(ID => toBeDeleted.add(ID))
                }
                //console.groupEnd()
            }
            //console.groupEnd()
        }
        //console.groupEnd()
        //console.log(toBeDeleted)
        toBeDeleted.forEach(id => {
            let position = Utils.positionFromID(id)
            this.board[position.row][position.column].color = undefined
            this.points += Game.POINTS_FOR_BALL
        })
    }
}