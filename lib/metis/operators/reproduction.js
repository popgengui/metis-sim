/** Reproduction
 *
 * @module operators/reproduction
 */

/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/


import {BaseOperator} from '../operator'
import {assign_random_sex} from '../individual'
import {generate_basic_individual} from '../integrated'

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
        this._species = species
        this._size = size
    }

    set size(size) {this._size = size}

    get size() {return this._size}

    get species() {return this._species}
}


export class ClonalReproduction extends BaseReproduction {
}


export class SexualReproduction extends BaseReproduction {
    constructor (species, size, mater=RandomMater,
        generator=StandardSexualGenerator) {
        super(species, size)
        this.mater = mater
        this.generator = generator
    }

    change (global_parameters, cycle, individuals, operators) {
        let mater = new Mater(this, individuals)
        let new_individuals = individuals.slice()
        this.cycle = cycle
        for (let i=0; i<this.size; i++) {
            let parents = mater.mate()
            let generator = new this.generator(this, [], parents)
            individuals.push(generator.generate())
        }
        return {global_parameters, individuals, operators}
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
    constructor(reproductor, annotators, parents) {
        this._reproductor = reproductor
        this._annotators = annotators
        this._parents = parents
        //parents will be different with sexual/asexual
    }

    generate() {
        throw TypeError('Base class')
    }

    annotate(individual) {
        for(let annotator of this._annotators) {
            annotator(individual, this._parents)
        }
    }
}


export class SexualGenerator extends IndividualGenerator {
    constructor(reproductor, annotators, parents) {
        super(reproductor, annotators, parents)
    }
}


export class StandardSexualGenerator extends SexualGenerator {
    constructor(reproductor, annotators, parents) {
        let my_annotators = annotators.slice()
        my_annotators.unshift((individual, parents) => {assign_random_sex(individual)})
        super(reproductor, my_annotators, parents)
    }

    //What is "standard" will depend on genetics
    generate() {
        let individual = generate_basic_individual(this._reproductor.species,
            this._reproductor.cycle)
        this.annotate(individual)
        return individual
    }
}
