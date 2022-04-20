import "./proto";
import {AStarBoardValues, BallColors, RGBColor, TBoardPiece, TBoardPosition} from "./Types";
import {Game} from "./Game";
import {AStar} from "./Pathfinding";
import {ICell, IGenericCell, Point} from "./Interfaces";

export class Utils {
    static rgbToHexString(color: RGBColor): string {
        return `#${color.red.toString(16).padStart(2, '0')}${color.green.toString(16).padStart(2, '0')}${color.blue.toString(16).padStart(2, '0')}`
    }

    static intToRGB(color: BallColors): RGBColor {
        return {
            red: Math.floor(color / 16**4),
            green: Math.floor(color % 16**4 / 16**2),
            blue: Math.floor(color % 16**2)
        }
    }

    static intToHexString(color: BallColors): string {
        return Utils.rgbToHexString(Utils.intToRGB(color))
    }

    static grayscale(color: RGBColor): RGBColor {
        let sum = color.red + color.green + color.blue
        let average = Math.floor((sum * 255) / 765)
        return {
            red: average,
            green: average,
            blue: average,
        }
    }

    static gameBoardToAstarBoard(gameBoard: TBoardPiece[][]): AStarBoardValues[][] {
        let result = []
        for (let row of gameBoard) {
            let resultRow = []
            for (let cell of row) {
                resultRow.push(cell.color !== undefined ? AStarBoardValues.Wall : AStarBoardValues.Empty)
            }
            result.push(resultRow)
        }
        return result
    }

    static iterateDiagonallyLeft<K>(array: K[][]): K[][] {
        let result = []
        for (let k = array.length*2 - 1; k >= 0; k--) {
            let resultRow = []
            for (let j = 0, i = Math.abs(k-array.length); i < array.length; j++, i++) {
                resultRow.push(k-array.length > 0 ? array[i][j] : array[j][i])
            }
            if (resultRow.length) {
                result.push(resultRow)
            }
        }
        return result
    }

    static iterateDiagonallyRight<K>(array: K[][]): K[][] {
        let result = []
        for (let k = 0; k < array.length * 2; k++) {
            let resultRow = []
            for (let j = 0; j <= k; j++) {
                let i = k - j;
                if (i < array.length && j < array.length) {
                    resultRow.push(array[i][j])
                }
            }
            if (resultRow.length) {
                result.push(resultRow)
            }
        }
        return result
    }

    static iterateVertically<K>(array: K[][]): K[][] {
        let result = []
        for (let j = 0; j < array.length; j++){
            let resultRow = []
            for (let i = 0; i < array.length; i++) {
                resultRow.push(array[i][j])
            }
            result.push(resultRow)
        }
        return result
    }

    static RandomEffectDecorator(target: Game, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("I decorated the function!")
        console.log(target)
        console.log(propertyKey)
        console.log(descriptor.value())
    }

    // static WrapWith(wrappingFunction: (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void) {
    //     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    //         let originalMethod = descriptor.value;
    //         descriptor.value = function (...args: any[]) {
    //             let result = originalMethod.apply(this, args);
    //             return result;
    //         }
    //     }
    // }

    static randEnumValue<T>(enumObj: T): T[keyof T] {
        const enumValues = Object.values(enumObj).filter(el => typeof el === "number");
        const index = Math.floor(Math.random() * enumValues.length);

        return enumValues[index];
    }

    static clearCellBackgroundIn(board: TBoardPiece[][]) {
        for (let row of board) {
            for (let cell of row) {
                cell.htmlElement.style.backgroundColor = Utils.intToHexString(BallColors.White)
            }
        }
    }

    static getAStarPathFor(board: TBoardPiece[][], start: TBoardPiece, end: TBoardPiece) {
        let aStarInstance = new AStar()
        let preparedBoard = Utils.gameBoardToAstarBoard(board)
        preparedBoard[start.position.row][start.position.column] = AStarBoardValues.Start
        preparedBoard[end.position.row][end.position.column] = AStarBoardValues.End
        aStarInstance.setTable(preparedBoard)
        let path = aStarInstance.getAStarPath()
        return Utils.aStarPathToCoordinateList(path )
    }

    static tBoardPositionToTuple(position: TBoardPosition): [number, number] {
        return [position.row, position.column]
    }

    static isSurrounded(board: TBoardPiece[][], cell: TBoardPiece) {
        let c = Utils.tBoardPositionToTuple(cell.position)
        for (let xyPair of [
            [c[0], c[1]-1], //left
            [c[0], c[1]+1], //right
            [c[0]-1, c[1]], //up
            [c[0]+1, c[1]]  //down
        ]) {
            if (board[xyPair[0]][xyPair[1]]) {
                if (board[xyPair[0]][xyPair[1]].color === undefined) {
                    return false
                }
            }
        }
        return true
    }

    static aStarPathToCoordinateList(path: Point[] | false): TBoardPosition[] | false {
        if (!path) return path
        return path.map(node => {return {
            column: node.x,
            row: node.y
        }})
    }

    static setCellBackground(htmlElement: ICell, color: BallColors) {
        htmlElement.style.backgroundColor = Utils.intToHexString(color)
    }

    static toggleIsClicked(cell: TBoardPiece) {
        if (cell.ball) {
            if (cell.isClicked) {
                cell.ball.classList.remove("clicked")
                cell.ball.classList.add("normal")
                cell.isClicked = false
            } else {
                cell.ball.classList.remove("normal")
                cell.ball.classList.add("clicked")
                cell.isClicked = true
            }
        }
    }

    static populateBoard<K extends IGenericCell>(height: number, width: number, parentElement: HTMLTableElement, cellClassName?: string): K[] {
        let cells: K[] = []
        for (let i = 0; i < height; i++) {
            let htmlRow = document.createElement("tr", {
                id: `${parentElement.id}-row-${i}`
            })
            for (let j = 0; j < width; j++) {
                cells.push({
                    htmlElement: document.createElement("td", {
                        className: cellClassName,
                        id: `${parentElement.id}-cell-[${i},${j}]`
                    }).appendTo(htmlRow)
                } as K)
            }
            htmlRow.appendTo(parentElement)
        }
        return cells
    }

    static squash2dArray<K>(array: K[][]): K[] {
        let result = []
        for (let row of array) {
            result.push(...row)
        }
        return result
    }

    static positionFromID(id: string): TBoardPosition {
        let strArr = id.split("-")[2].replace(/[\[\]]/g, "").split(",")
        return {
            row: parseInt(strArr[0]),
            column: parseInt(strArr[1])
        }
    }
}