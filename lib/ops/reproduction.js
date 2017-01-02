/** Reproduction
 *
 * @module reproduction
 */

import {BaseOperator} from './init.js'

export class BaseReprodution extends BaseOperator {
    constructor (size) {
        this._size = size
    }

    set size (size) {this._size = size}
    get size () {return this._size}
}

export class ClonalReprodution extends BaseReprodution {
}


export class SexualReprodution extends BaseReprodution {
    apply (individuals, operators) {

    }
}
