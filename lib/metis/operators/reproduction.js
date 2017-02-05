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
- Individual generators

Sexual and asexual reproduction are considered
 */

/**
 * Base class for reproduction.
 */
export class BaseReproduction extends BaseOperator {
    constructor (species, size, annotators=[]) {
        super()
        this._species = species
        this._size = size
        this._annotators = annotators
    }

    change (global_parameters, cycle, individuals, operators) {
        throw TypeError('Base class')
    }

    set size(size) {this._size = size}

    get size() {return this._size}

    get species() {return this._species}

    get annotators() {return this._annotators}
}


export class ClonalReproduction extends BaseReproduction {
}


export class SexualReproduction extends BaseReproduction {
    constructor (species, size, annotators=[], mater=RandomMater,
        generator=StandardSexualGenerator) {
        super(species, size, annotators)
        this.mater = mater
        this.generator = generator
    }

    change (global_parameters, cycle, individuals, operators) {
        let mater = new Mater(this, individuals)
        let new_individuals = individuals.slice()
        this.cycle = cycle
        for (let i=0; i<this._size; i++) {
            let parents = mater.mate()
            let generator = new this.generator(this, this.annotators, parents)
            new_individuals.push(generator.generate())
        }
        return {global_parameters, individuals: new_individuals, operators}
    }
}


//Mater

/**
 * Abstract class for mating systems.
 * 
 */
export class Mater {
    constructor (reproductor, individuals) {
        this._reproductor = reproductor
        this._individuals = individuals
    }

    /**
     * Mate method. Returns {mother, father}
     */
    *mate() {
        throw TypeError('Base class')
    }
}


export class RandomMater extends Mater {
    *mate() {
        let wrapper = new WrapperChooser(this._individuals)
        let mother_chooser = new SexChooser(wrapper, true)
        let father_chooser = new SexChooser(wrapper, false)
        let random_mother_choice = new RandomChooser(mother_chooser).choose()
        let random_father_choice = new RandomChooser(father_chooser).choose()
        while (true) {
            yield {
                mother: random_mother_choice.next().value,
                father: random_father_choice.next().value
            }
        }
    }
}



//parent choosers
export class Chooser {
    constructor (source=undefined) {
        this._is_finite = true
        this._source = source
    }

    *choose() {
        throw TypeError('Base class')
    }

    get is_finite() {return this._is_finite}
}


export class WrapperChooser extends Chooser {
    constructor (individuals) {
        super()
        this._individuals = individuals
    }

    *choose() {
        for (let individual of this._individuals) yield individual
    }
}


export class SexChooser extends Chooser {
    constructor (source, is_female) {
        super(source)
        this._is_female = is_female
    }

    *choose() {
        for (let individual of this._source.choose()) {
            if (individual.is_female === this._is_female) yield individual
        }
    }
}


export class RandomChooser extends Chooser {
    constructor (source) {
        super()
        this._is_finite = false
        if (!source.is_finite ) {
            throw TypeError('Cannot have infinite source')
        }
        let individuals = []
        for (let individual of source.choose()) individuals.push(individual)
        this.individuals = individuals
    }

    *choose() {
        while(true) {
            let pos = Math.random() * (this.individuals.length)
            yield this.individuals[Math.floor(pos)]
        }
    }
}


//individual generators
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
