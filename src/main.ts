import "./proto"
import "./style.css";
import {Game} from "./Game";
new Game("dupa")
console.log("equality check:", [
    {
        b: [2, 3, 1],
        a: 23,
    },
    25, 62, 12,
    "a", "b", "c"
].isEqualTo([
    25, 12, 62,
    {
        a: 23,
        b: [1, 2, 3]
    },
    "a", "c", "b"
]))
// for (let i = 0; i < Game.BOARD_HEIGHT-1; i++) {
//     for (let j = 0; j < Game.BOARD_HEIGHT-1; j++) {
//         g.placeBall({
//             column: j,
//             row: i
//         }, Utils.randEnumValue(BallColors))
//     }
// }
// g.drawBoard()
// g.checkForLines()
// g.drawBoard()