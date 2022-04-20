import {
    AStarBoardValues,
    AStarConnectionTypes,
    BallColors,
    StoredDataTypeNameMap,
    TableCellData,
    ValueOf
} from "./Types";

export interface Point {
    id: string
    x: number
    y: number
    value: AStarBoardValues
    connections: Link[]
}

export interface Link {
    point: Point
    cost: number
    type: AStarConnectionTypes
    used: boolean
}

export interface ICell extends Omit<HTMLTableCellElement, 'storedData'> {
    storedData?: TableCellData
}

export interface IGenericCell {
    htmlElement: HTMLTableCellElement
}

export interface ITableCell extends IGenericCell{
    color: BallColors
}

export interface IBall extends HTMLDivElement {}

export interface IMouseEvent extends Omit<MouseEvent, 'target'> {
    target: ICell;
}

export interface IElementCreationOptions extends ElementCreationOptions {
    className?: string
    id?: string
    onclick?: ((this: GlobalEventHandlers, ev: IMouseEvent) => any) | null
    onmouseenter?: ((this: GlobalEventHandlers, ev: IMouseEvent) => any) | null
    onmouseleave?: ((this: GlobalEventHandlers, ev: IMouseEvent) => any) | null
    style?: Partial<CSSStyleDeclaration>
    storedData?: ValueOf<StoredDataTypeNameMap>
    innerHTML?: string
    innerText?: string

    is?: string
}