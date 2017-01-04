/** Reproduction
 *
 * @module reproduction
 */

import {BaseOperator} from '../operator.js'
import {assign_random_sex, generate_basic_individual} from '../individual.js'

/*
We have:
- Reproduction operators (top-level)
- Mating operators, for sexual reproduction
- (Parent) choosers
- Generators

Sexual and asexual reproduction are considered
 */

export class BaseReproduction extends BaseOperator {
    constructor (species, size) {
        super()
        this.species = species
        this._size = size
    }

    set size (size) {this._size = size}
    get size () {return this._size}
}


export class ClonalReproduction extends BaseReproduction {
}

export class SexualReproduction extends BaseReproduction {
    constructor (size, mater=RandomMater,
        generator=StandardSexualGenerator) {
        this.size = size
        this.mater = mater

    }

    change (individuals, operators) {
        let mater = Mater(reproductor, individuals)
        let new_individuals = []
        for (let individual of individuals) {
            new_individuals.push(individual)
            //XXX: better copy?
        }
        for (let i=0; i<this.size; i++) {
            let parents = mater.mate()
        }
        return {individuals, operators}
    }
}


//Mater

export class Mater {
    constructor (reproductor, individuals) {
        this.reproductor = reproductor
        this.individuals = individuals
    }

    *mate() {
        throw TypeError('Base class')
    }
}


export class RandomMater {
    *mate() {
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



//generators
export class IndividualGenerator {
    constructor(reproductor, annotators) {
        this.reproductor = reproductor
        this.annotators = annotators
    }

    generate() {
        throw TypeError('Base class')
    }

    annotate(individual) {
        for(let annotator of annotators) {
            annotator()
        }
    }
}


export class SexualGenerator extends IndividualGenerator {
    constructor(reproductor, annotators, mother, father) {
        super(reproductor, annotators)
        this.mother = mother
        this.father = father
    }

}

export class StandardSexualGenerator extends SexualGenerator {
    constructor(reproductor, annotators) {
        super(reproductor, [assign_random_sex] + annotators)
    }
    //What is "standard" will depend on genetics
    generate() {
        let individual = generate_basic_individual()
        annotate(individual)
    }
}
