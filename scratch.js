function sets(num) {
    let elementsInFirstSet = Math.floor(Math.random()*num-1)+1
    console.log("elemefirst", elementsInFirstSet)
    let firstSet = []
    let secondSet = []
    let counter = 1
    for (;counter <= elementsInFirstSet; counter++){
        firstSet.push({
            value: counter,
            connections: []
        })
    }

    for (;counter <= num; counter++){
        secondSet.push({
            value: counter,
            connections: []
        })
    }

    for (let el of firstSet) {
        let elsInSecondSet = secondSet.map(el => el.value)
        let numOfConns = Math.floor(Math.random()*secondSet.length)+1
        for (let i = 0; i < numOfConns; i++) {
            let randomElNumber = elsInSecondSet.splice(Math.floor(Math.random()*elsInSecondSet.length), 1)
            el.connections.push(secondSet.find(el => el.value == randomElNumber))
        }
    }

    for (let el of secondSet) {
        let elsInFirstSet = firstSet.map(el => el.value)
        let numOfConns = Math.floor(Math.random()*firstSet.length)+1
        for (let i = 0; i < numOfConns; i++) {
            let randomElNumber = elsInFirstSet.splice(Math.floor(Math.random()*elsInFirstSet.length), 1)
            el.connections.push(firstSet.find(el => el.value == randomElNumber))
        }
    }

    console.log(firstSet)
    console.log(secondSet)
}
