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

//See choosers below

export class ClonalReproduction extends BaseReproduction {
}


export class SexualReproduction extends BaseReproduction {
    constructor (size, mater=RandomMater) {
        this.size = size
        this.mater = mater

    }

    change (individuals, operators) {
        let mater = Mater(individuals)
        for (let i=0; i<this.size; i++) {
            let parents = mater.mate()
        }
        return {individuals, operators}
    }
}


//Mater

export class Mater {
    constructor (individuals) {
        this.individuals = individuals
    }

    *mate() {
        throw TypeError('Base class')
    }
}


export class RandomMater {
    *mate() {
        throw TypeError('Base class')
    }
}

//choosers


export class Chooser {
    constructor (source=undefined) {
        this.is_finite = true
        this.source = source
    }

    *choose() {
        throw TypeError('Base class')
    }
}

export class WrapperChooser extends Chooser {
    constructor (individuals) {
        super()
        this.individuals = individuals
    }

    *choose() {
        for (let individual of this.individuals) yield individual
    }
}

export class SexChooser extends Chooser {
    constructor (source, is_female) {
        super(source)
        this.is_female = is_female
    }

    *choose() {
        for (let individual of source) {
            if (individual.is_female === this.is_female) yield individual
        }
    }
}


export class RandomChooser extends Chooser {
    constructor (source) {
        super()
        this.is_finite = false
        if (!source.is_finite ) {
            throw TypeError('Cannot have infinite source')
        }
        let individuals = []
        for (let individual of source) individuals.push(individual)
        this.individuals = individuals
    }

    *choose() {
        while(true) {
            let pos = Math.random() * (this.individuals.length)
            yield this.individuals[Math.floor(pos)]
        }
    }
}
