/** Reproduction
 *
 * @module reproduction
 */

import {BaseOperator} from '../ops.js'

export class BaseReproduction extends BaseOperator {
    constructor (size) {
        super()
        this._size = size
    }

    set size (size) {this._size = size}
    get size () {return this._size}
}

export class ClonalReproduction extends BaseReproduction {
}


export class SexualReproduction extends BaseReproduction {
    change (individuals, operators) {
        for (let i=0; i<this.size; i++) {

        }
        return {individuals, ops: operators}
    }
}
