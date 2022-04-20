import {IElementCreationOptions} from "./Interfaces";
import {StoredDataTypeNameMap, ValueOf} from "./Types";

export {}


declare global {
    interface Array<T> {
        random: (() => T | undefined)
        reverse: (() => T[])
        isEqualTo: ((array: T[]) => boolean)
        isArray: ((array: T[]) => array is T[])
    }

    interface Document {
        createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: IElementCreationOptions | undefined): HTMLElementTagNameMap[K]
    }

    interface HTMLElement {
        appendTo(element: HTMLElement): this
        storedData?: ValueOf<StoredDataTypeNameMap>
    }
}

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.reverse = function () {
    let result: any[] = []
    for (let i = this.length; i > 0; i--) {
        result.push(this[i-1])
    }
    return result
}

Array.prototype.isEqualTo = function (array) {
    let sortedThis = this.sort()
    let sortedArray = array.sort()
    console.group("Indent")
    if (this.length === array.length) {
        for (let i = 0; i < array.length; i++) {
            if (typeof sortedThis[i] === typeof sortedArray[i]) {
                if (typeof sortedThis[i] === "object") {
                    if (Array.isArray(sortedThis[i])) {
                        let x = sortedThis[i].isEqualTo(sortedThis[i])
                        console.groupEnd()
                        if (!x) {
                            return x
                        }
                    } else {
                        let x = checkIterableEquality(sortedThis[i], sortedArray[i])
                        console.groupEnd()
                        if (!x) {
                            return x
                        }
                    }
                } else {
                    if (this[i] !== array[i]) {
                        console.log("value not equal", i)
                        console.groupEnd()
                        return false
                    }
                }
            } else {
                console.log("type not equal", i)
                console.groupEnd()
                return false
            }
        }
    } else {
        console.log("length not equal")
        console.groupEnd()
        return false
    } return true
}

function checkIterableEquality(iterable1: any, iterable2: any): boolean{
    let entriesOf1 = Object.entries(iterable1).sort()
    let entriesOf2 = Object.entries(iterable2).sort()
    console.group("Indent")
    if (entriesOf1.length === entriesOf2.length) {
        for (let i = 0; i < entriesOf1.length; i++) {
            if (entriesOf1[i][0] !== entriesOf2[i][0]) {
                console.log("keys not equal", i)
                console.groupEnd()
                return false
            } else {
                if (typeof entriesOf1[i][1] === typeof entriesOf2[i][1]) {
                    if (typeof entriesOf1[i] === "object") {
                        if (Array.isArray(entriesOf1[i][1])) {
                            let x = (entriesOf1[i][1] as any[]).isEqualTo(entriesOf2[i][1] as any[])
                            console.groupEnd()
                            if (!x) {
                                return x
                            }
                        } else {
                            let x = checkIterableEquality(entriesOf1[i][1], entriesOf2[i][1])
                            console.groupEnd()
                            if (!x) {
                                return x
                            }
                        }
                    } else {
                        if (entriesOf1[i][1] !== entriesOf2[i][1]) {
                            console.log("value not equal", i)
                            console.groupEnd()
                            return false
                        }
                    }
                } else {
                    console.log("type not equal", i)
                    console.groupEnd()
                    return false
                }
            }
        }
    } else {
        console.log("length not equal")
        console.groupEnd()
        return false
    } return true
}

document.createElement = function (original: <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined) => HTMLElementTagNameMap[K]) {
    //console.log(original)
    return function <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: IElementCreationOptions | undefined) {
        let el = original.call(document, tagName) as HTMLElementTagNameMap[K]
        if (options) {
            for (const [key, value] of Object.entries(options)) {
                //console.log(key, value, !!value)
                if (key == "style") {
                    for (const [cssPropertyName, cssPropertyValue] of Object.entries(value as Partial<CSSStyleDeclaration>)) {
                        (el.style as {[key: string]: any})[cssPropertyName] = cssPropertyValue
                        //console.log(cssPropertyName, cssPropertyValue)
                    }
                } else if (key == "storedData") {
                    el.storedData = options.storedData
                } else if (value) {
                    (el as {[key: string]: any})[key as string] = value
                }
            }
        }

        el.appendTo = function (element: HTMLElement): HTMLElementTagNameMap[K] {
            element.append(el)
            return el
        }
        return el
    }
}(document.createElement)
