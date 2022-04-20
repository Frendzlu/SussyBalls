import {IBall, ICell} from "./Interfaces";

export type ValueOf<T> = T[keyof T];
export type MappedType<U, T extends keyof U> = U[T]
export type StoredDataType<T extends keyof StoredDataTypeNameMap> = StoredDataTypeNameMap[T]

/** The position inside 2d array */
export type TBoardPosition = {
    column: number
    row: number
}


export type TBoardPiece = {
    htmlElement: ICell
    isClicked: boolean
    ball?: IBall
    color: BallColors | undefined
    position: TBoardPosition
}

export enum BallColors {
    Black = 0,
    Blue = 65433,
    Orange = 52224,
    Fuchsia = 16711935,
    Red = 16711680,
    Yellow = 16776960,
    White = 16777215,
}

export enum AStarBoardValues {
    Wall,
    Empty,
    Start,
    End
}

export enum AStarConnectionTypes {
    Orthogonal,
    Diagonal,
    Other
}

export type RGBColor = {
    red: number
    green: number
    blue: number
}

export type TableCellData = {
    position?: TBoardPosition
    isClicked?: boolean
}

export class CSStyles implements Partial<CSSStyleDeclaration> {
    constructor(options: Partial<CSSStyleDeclaration>) {
        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined) {
                (this as {[key: string]: any})[key as string] = value
            }
        }
    }
}

export type StoredDataTypeNameMap = {
    td: TableCellData
}