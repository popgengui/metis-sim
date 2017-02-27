/** Reproduction
 *
 * @module operators/reproduction
 */

/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/


import {BaseOperator} from '../operator'
import {assign_random_sex, generate_basic_individual} from '../individual'
//import {generate_individual_with_genome} from '../integrated'

/*
We have:
- Reproduction operators (top-level)
- Mating operators, for sexual reproduction
- (Parent) choosers
- Individual generators
- Annotators

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

    change (state) {
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
    /**
     * Sexual Reproduction.
     * The generator object will only be constructed with
     *   reproductor (this) and annotators. The rest will be default 
     */
    constructor (species, size, annotators=[], mater=RandomMater,
        generator=SexualGenerator) {
        super(species, size, annotators)
        this.mater = mater
        this.generator = generator
    }

    change (state) {
        let mate_individuals = state.individuals.slice()
        let mater = new this.mater(this, mate_individuals)
        this.cycle = state.cycle
        let generator = new this.generator(this, this.annotators)
        for (let i=0; i<this._size; i++) {
            let parents = mater.mate().next().value
            generator.mother = parents.mother
            generator.father = parents.father
            state.individuals.push(generator.generate())
        }
    }
}


export class NoGenomeSexualReproduction extends SexualReproduction {
    constructor (species, size, annotators=[], mater=RandomMater) {
        super(species, size, annotators, mater, NoGenomeSexualGenerator)
    }
}


export class StructuredSexualReproduction extends BaseReproduction {
    /**
     * Structured Sexual Reproduction. Population based
     * The generator object will only be constructed with
     *   reproductor (this) and annotators. The rest will be default 
     */
    constructor (species, pop_size, num_pops, annotators=[], mater=RandomMater,
        generator=SexualGenerator) {
        super(species, pop_size * num_pops, annotators)
        this.pop_size = pop_size
        this.num_pops = num_pops
        this.mater = mater
        this.generator = generator
        this.deme_reproductor = new SexualReproduction(
            species, pop_size, annotators, mater, generator)
    }

    change (state) {
        let pop_individuals = []
        for (let pop=0; pop<this.num_pops; pop++) {
            pop_individuals.push([])
        }
        for (let individual of state.individuals) {
            pop_individuals[individual.pop].push(individual)

        }
        for (let pop=0; pop<this.num_pops; pop++) {
            let pop_state = {cycle: state.cycle, individuals: pop_individuals[pop]}
            let start_ind = pop_individuals[pop].length
            this.deme_reproductor.change(pop_state)
            state.individuals.push.apply(state.individuals,
                pop_state.individuals.slice(start_ind))
        }
    }
}


export class NoGenomeStructuredSexualReproduction extends StructuredSexualReproduction {
    constructor (species, pop_size, num_pops, annotators=[], mater=RandomMater) {
        super(species, pop_size, num_pops, annotators, mater, NoGenomeSexualGenerator)
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
    constructor(reproductor, annotators, parent) {
        this._reproductor = reproductor
        this._annotators = annotators
        this._parent = parent
        //parents will be ignored on sexual reproduction
    }

    generate() {
        throw TypeError('Base class')
    }

    annotate(individual) {
        for(let annotator of this._annotators) {
            annotator(individual, [this._parent])
        }
    }
}


export class SexualGenerator extends IndividualGenerator {
    constructor(reproductor, annotators=[],
        assign_sex=true, standard_transmission_genetics=true) {
        let my_annotators = annotators.slice()
        if (standard_transmission_genetics) {
            my_annotators.unshift(transmit_sexual_genome)
        }
        if (assign_sex) {
            my_annotators.unshift((individual, parents) => {assign_random_sex(individual)})
        }
        super(reproductor, my_annotators)
    }

    generate() {
        let individual = generate_basic_individual(this._reproductor.species,
            this._reproductor.cycle)
        this.annotate(individual)
        return individual
    }

    get mother() {return this._mother}
    set mother(mother) {this._mother = mother}

    get father() {return this._father}
    set father(father) {this._father = father}

    annotate(individual) {
        for(let annotator of this._annotators) {
            annotator(individual, [this.mother, this.father])
        }
    }

}


export class NoGenomeSexualGenerator extends SexualGenerator {
    constructor(reproductor, annotators=[],
        assign_sex=true) {
        super(reproductor, annotators, assign_sex, false)
    }
}


// Annotators

export function annotate_with_parents(individual, parents) {
    for (let parent of parents) {
        if (parent.is_female) {
            individual.mother = parent.id
        }
        else {
            individual.father = parent.id            
        }
    }
}


export function transmit_sexual_genome(individual, parents) {
    let species = individual.species
    let genome = species.genome
    let metadata = genome.metadata
    let position = 0
    let genome_buffer = new ArrayBuffer(genome.size)
    let genome_data = new Uint8Array(genome_buffer)
    individual.genome = genome_data
    for (let marker_name of genome.marker_order) {
        let marker = metadata[marker_name]
        marker.reproduce(individual, parents, position)
        position += marker.size
    }
}