import {Link, Point} from "./Interfaces";
import {AStarBoardValues, AStarConnectionTypes} from "./Types";

export class AStar {
    start: Point
    end: Point
    map: Point[] = []

    static ORTHOGONAL_MVT_COST: number = 10
    static DIAGONAL_MVT_COST: number = 14
    ALLOWED_CONNECTIONS: AStarConnectionTypes[] = [AStarConnectionTypes.Orthogonal]
    TERRAIN_MODIFIERS: { [key: string]: any } = {

    }

    WALKABLE = [AStarBoardValues.Empty, AStarBoardValues.Start, AStarBoardValues.End]

    constructor() {
        this.start = { x: 0, y: 0, value: AStarBoardValues.Start, connections: [], id: "0-0" }
        this.end = { x: 0, y: 0, value: AStarBoardValues.End, connections: [], id: "0-0" }
        this.start.connections.push({ type: AStarConnectionTypes.Orthogonal, point: this.end, cost: 0, used: false })
        this.end.connections.push({ type: AStarConnectionTypes.Orthogonal, point: this.start, cost: 0, used: false })
    }

    getEstimatedDistance(start: Point, end: Point): number {
        //returns distance between two points calculated by Manhattan method
        console.log(start, end)
        return Math.abs(end.x - start.x) + Math.abs(end.y - start.y)
    }

    getScore(from: Point, to: Point, goal: Point): number {
        let h = this.getEstimatedDistance(to, goal)
        console.log("Estimated distance:", h)
        let g = 0
        for (let link of from.connections) {
            if (link.point == to)
                g = link.cost
        }
        return g + h * AStar.ORTHOGONAL_MVT_COST
    }

    setTable(table: AStarBoardValues[][]) {
        this.map = []
        console.table(table)
        let result: Point[][] = []
        for (let i = 0; i < table.length; i++) {
            let row: Point[] = []
            for (let j = 0; j < table[i].length; j++) {
                row.push({ x: j, y: i, value: table[i][j], connections: [], id: `${j}-${i}` })
            }
            result.push(row)
        }
        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[i].length; j++) {
                let singleNode = result[i][j]
                let conns: Link[] = []

                if (i !== 0) {
                    conns.push({ point: result[i - 1][j], cost: AStar.ORTHOGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Orthogonal })
                    if (j !== 0) {
                        conns.push({ point: result[i - 1][j - 1], cost: AStar.DIAGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Diagonal })
                    }
                    if (j !== result[i].length) {
                        conns.push({ point: result[i - 1][j + 1], cost: AStar.DIAGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Diagonal })
                    }
                }
                if (i !== result.length - 1) {
                    conns.push({ point: result[i + 1][j], cost: AStar.ORTHOGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Orthogonal })
                    if (j !== 0) {
                        conns.push({ point: result[i + 1][j - 1], cost: AStar.DIAGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Diagonal })
                    }
                    if (j !== result[i].length) {
                        conns.push({ point: result[i + 1][j + 1], cost: AStar.DIAGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Diagonal })
                    }
                }
                if (j !== 0) {
                    conns.push(
                        { point: result[i][j - 1], cost: AStar.ORTHOGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Orthogonal }
                    )
                }
                if (j !== result[i].length) {
                    conns.push(
                        { point: result[i][j + 1], cost: AStar.ORTHOGONAL_MVT_COST, used: false, type: AStarConnectionTypes.Orthogonal }
                    )
                }

                for (let conn of conns) {
                    if (conn.point && this.WALKABLE.includes(conn.point.value)) {
                        conn.cost *= this.TERRAIN_MODIFIERS[conn.point.value] || 1.0
                        singleNode.connections.push(conn)
                    }
                }
                this.map.push(singleNode)
                switch (singleNode.value) {
                    case AStarBoardValues.Start:
                        this.start = singleNode
                        break;
                    case AStarBoardValues.End:
                        this.end = singleNode
                        break;
                }
            }
        }
        //console.log(this.map)
    }

    getPath(start?: Point, end?: Point): Point[] | false {
        //console.log(this.map)
        let currentPoint = start || this.start
        let endPoint = end || this.end
        let path: Point[] = [currentPoint]
        while (currentPoint != endPoint) {
            //console.log("Current point:", currentPoint, ", End point:", endPoint)
            let bestLink = this.getBestOptions(currentPoint, this.end).random()
            //console.log("Best link:", bestLink)
            if (!bestLink) {
                //console.log("No best link found")
                if (path.length == 0 || path.length == 1) {
                    //console.groupEnd()
                    return false
                } else {
                    //console.log(path.pop())
                    currentPoint = path[path.length - 1]
                }
                //console.log("Path:", path)
                //console.groupEnd()
            } else {
                //console.log("Best link found")
                bestLink.used = true
                let toPush = bestLink.point as Point
                let reverseBestConnection = bestLink.point.connections.find(link => link.point == currentPoint)
                if (reverseBestConnection){
                    reverseBestConnection.used = true
                }
                path.push(toPush)
                //console.log("Path:", path)
                //console.groupEnd()
                currentPoint = toPush
            }
        }
        return path
    }

    getReversedPath(currentPath: Point[], start?: Point): Point[] {
        let startPoint = start || this.start
        let endPath: Point[] = []
        console.group("Backwards")
        console.log("Current path:", currentPath)
        for (let i = currentPath.length-1; i > 0; i--) {
            console.group("Iteration", i)
            console.log("currentPath[i]:", currentPath[i])
            let currentParent = currentPath[i].connections.find(connection => connection.point == currentPath[i-1])!
            let bestPoints = this.getBestOptions(currentPath[i], startPoint).map(link => link.point)
            console.log("Best points:", bestPoints)
            console.log("Current point:", currentParent.point)
            console.log("Best points includes:", bestPoints.includes(currentParent.point))
            if (!bestPoints.includes(currentParent.point)) {
                let path = this.getPath(currentPath[i], startPoint)
                if (path) {
                    endPath.push(...path)
                    return endPath
                } else {
                    endPath.push(currentPath[i])
                }
            } else {
                endPath.push(currentPath[i])
            }
            console.log("End path:", endPath)
            console.groupEnd()
        }
        endPath.push(currentPath[0])
        console.groupEnd()
        return endPath
    }

    clearConnectionUsage() {
        for (let point of this.map) {
            for (let conn of point.connections) {
                conn.used = false
            }
        }
    }

    getAStarPath(start?: Point, end?: Point): Point[] | false {
        let startPoint = start || this.start
        let endPoint = end || this.end
        let predictedPath = this.getPath(startPoint, endPoint)
        if (!predictedPath) {
            return predictedPath
        }
        this.clearConnectionUsage()
        let reversePath = this.getReversedPath(predictedPath, startPoint)
        let predMapped = predictedPath.map(element => [element.x, element.y])
        let revMapped = reversePath.map(element => [element.x, element.y])
        console.log("Predicted:", predMapped)
        console.log("Reversed:", revMapped)
        console.log("Equality check:", predMapped.isEqualTo(revMapped.reverse()))
        return reversePath
    }

    getBestOptions(point: Point, target: Point): Link[] {
        console.group("getBestOptions")
        console.log("Picking best options from:", point.connections)
        let lowestScore = Infinity
        let chosenConns: Link[] = []
        for (let conn of point.connections) {
            console.group(point.connections.indexOf(conn))
            console.log("Debating on:", conn)
            if (!conn.used) {
                if (this.ALLOWED_CONNECTIONS.includes(conn.type)) {
                    let score = this.getScore(point, conn.point, target)
                    console.log("Lowest cost:", lowestScore)
                    console.log("Current cost:", score)
                    if (score < lowestScore) {
                        lowestScore = score
                        chosenConns = [conn]
                    } else if (score == lowestScore) {
                        chosenConns?.push(conn)
                    }

                }
            }
            console.groupEnd()
        }
        console.groupEnd()
        return chosenConns
    }

    // kurwa() {
    //     let open: ListNode[] = [{
    //         point: this.start,
    //         gCost: 0,
    //         hCost: this.getEstimatedDistance(this.start, this.end)
    //     }]
    //     let closed: ListNode[] = []
    //     let currentNode = open[0]
    //     let iter = 0
    //     while (open.length) {
    //         console.group(`Iteration ${iter}`)
    //         console.log(open, closed)
    //         currentNode = open.reduce((prev: ListNode, cur: ListNode) => prev.gCost + prev.hCost < cur.gCost + cur.hCost ? prev : cur)
    //         if (currentNode.point == this.end) break
    //         console.group("Connections")
    //         for (let connection of currentNode.point.connections) {
    //             console.log("Connection:", connection)
    //             console.group("Connection data")
    //             if (this.ALLOWED_CONNECTIONS.includes(connection.type)) {
    //                 let successor = connection.point
    //                 let successorCost = currentNode.gCost + connection.cost
    //                 let openSucc = open.find(node => node.point === successor)
    //                 let closedSucc = open.find(node => node.point === successor)
    //                 console.log("Successor:", successor)
    //                 console.log("Successor's cost:", successorCost)
    //                 console.log("Successor in open", openSucc)
    //                 console.log("Successor in closed", closedSucc)
    //                 if (openSucc){
    //                     if (openSucc.gCost > successorCost) {
    //                         open.push({
    //                             point: successor,
    //                             gCost: successorCost,
    //                             hCost: this.getEstimatedDistance(successor, this.end),
    //                             parent: currentNode
    //                         })
    //                     }
    //                 } else if (closedSucc) {
    //                     if (closedSucc.gCost > successorCost) {
    //                         closed.splice(closed.indexOf(closedSucc), 1)
    //                         open.push({
    //                             point: successor,
    //                             gCost: successorCost,
    //                             hCost: this.getEstimatedDistance(successor, this.end),
    //                             parent: currentNode
    //                         })
    //                     }
    //                 } else {
    //                     open.push({
    //                         point: successor,
    //                         gCost: successorCost,
    //                         hCost: this.getEstimatedDistance(successor, this.end),
    //                         parent: currentNode
    //                     })
    //                 }
    //                 closed.push(currentNode)
    //                 console.log("Closed", closed)
    //                 console.log("Open", open)
    //             }
    //             console.groupEnd()
    //         }
    //         console.groupEnd()
    //         console.groupEnd()
    //         iter++
    //         if (iter > 15) {
    //             break
    //         }
    //     }
    //     return currentNode.point === this.end ? closed : false
    // }
}
// type ListNode = {
//     point: Point
//     gCost: number
//     hCost: number
//     parent?: ListNode
// }