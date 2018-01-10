const EventEmitter = require('events').EventEmitter
const RxO = require('rxjs')


/** Stuff that JavaScript should have, but doesn't.
    Move somewhere else (other library) */
const randint = (a, b) => {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return Math.floor(Math.random() * (max - min)) + min  
}


/** A Genomic marker.
 *
 * This is an abstract class.
 */
class gn_Marker {
    /**
     * Create a marker.
     * @param {list} possible_values - List of possible values (uint8)
     */
    constructor (possible_values) {
        if (this.constructor === gn_Marker)
            throw new TypeError('Cannot construct Marker instances directly')
        this._possible_values = possible_values
    }


    /** Possible values for the marker */
    get possible_values() {
        return this._possible_values
    }

    set possible_values(possible_values) {
        this._possible_values = possible_values
    }

}


/**
 * A Single-Nucleotide Polymorphism (SNP).
 * @extends Marker
 */
class gn_SNP extends gn_Marker {
    /** Default for SNP is bi-allelic */
    constructor(possible_values=[0, 1]) {
        super(possible_values)
    }
}


/**
 * A Microsatelite.
 * @extends Marker
 */
class gn_MicroSatellite extends gn_Marker {
}



/**
 * A Complete chromosome.
 */
class gn_Chromosome {
    constructor (markers, distances=null) {  // distances in cMs
        if (distances !== null && (markers.length !== distances.length + 1)) {
            throw new RangeError('If distances are defined, its length has to be markers.length-1')
        }
        this._size = markers.length
        this._markers = markers
        this._distances = distances
    }

    get distances() {
        return this._distances
    }

    get markers() {
        return this._markers
    }
    
    get size() {
        return this._size
    }

    get is_autosomal() {
        return false
    }

    reproduce(individual, parent, ofs_position, parent_position) {
        for (let i=0; i<this._size; i++) {
            individual.genome[ofs_position + i] = parent.genome[parent_position + i]
        }
    }
}


/**
 * An Autosome. This version assumes full linkage and
 * transmits one gamete
 */
const gn_Autosome = Sup => class extends Sup {
    get size() {return 2*super.size}

    reproduce(individual, parents, position) {
        let [p1, p2] = [0, 1]
        if (Math.random() < 0.5) {
            [p1, p2] = [1, 0]
        }
        //This is wrong, always transmits the same gamete
        super.reproduce(individual, parents[p1], position, position)
        super.reproduce(individual, parents[p2], position + this.size / 2, position)
    }


    get markers() {
        let base_markers = super.markers
        return base_markers.concat(base_markers)
    }

    get is_autosomal() {
        return true
    }
}


/**
 * Chromosome pair.
 */
class gn_ChromosomePair extends gn_Autosome(gn_Chromosome) {
}


/**
 * A fully UnlinkedAutosome.
 * 
 * This could be done with a {@link LinkedAutosome} with
 * proper distances, but much more efficient
 * 
 * XXX: Do this as a mixin
 */
const gn_UnlinkedAutosome = Sup => class extends Sup {
    get size() {return 2*super.size}

    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }

}


/**
 * A LinkedAutosome.
 * Genomic distances come from Sup.
 */
const gn_LinkedAutosome = Sup => class extends Sup {
    get size() {return 2*super.size}

    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }
}


const gn_Mito = Sup => class extends Sup {}


const gn_YChromosome = Sup => class extends Sup {}


const gn_XChromosome = Sup => class extends Sup {
    get size() {return 2*super.size} // Always double for now

    reproduce(individual, parents, position) {
        ///XXX: Change here 
    }
}


//Genome
class gn_Genome {
    constructor (metadata) {
        //metadata is a map of {string} to {@link Marker}
        this._metadata = metadata
        this._compute_marker_positions()
        let last_marker_name = this._marker_order[this._marker_order.length -1]
        let last_marker_size = this._metadata[last_marker_name].size
        this._size = this.get_marker_start(last_marker_name) + last_marker_size
    }

    _compute_marker_positions() {
        this._marker_order = []
        this._marker_start = new Map()
        let start = 0
        for (let name in this._metadata) {
            this._marker_order.push(name)
            this._marker_start.set(name, start)
            start += this._metadata[name].size
        }
    }

    get_marker_start(name) {
        return this._marker_start.get(name)
    }

    get size() {
        return this._size
    }

    get marker_order() {
        return this._marker_order
    }

    get metadata() {
        return this._metadata
    }
}


const gn_generate_unlinked_genome = (num_markers, marker_generator) => {
    let metadata = {}
    let markers = []
    for (let i=0; i<num_markers; i++) {
        markers.push(marker_generator())
    }
    metadata.unlinked = new gn_ChromosomePair(markers)
    return new gn_Genome(metadata)
}


let _i_id = 0

/** A individual */
class i_Individual {
    /**
     * Create an individual
     * @param {Species} species
     * @param {int} cycle_born When the individual was born
     *
     * The individual will be assigned a unique ID and will be alive.
     */
    constructor (species, cycle_born=0) {
        this._id = i_Individual.global_id
        this.species = species
        this._alive = true
        this.cycle_born = cycle_born
    }

    static get global_id() {
        return _i_id ++
    }

    get id() {
        return this._id
    }

    get alive() {
        return this._alive
    }
}


/** Assigns a random sex to an individual.
 *
 * This is done by a is_female attribute
 */
let i_assign_random_sex = (individual) => {
    individual.is_female = Math.random() >= .5
    return individual
}

/** Create an individual for a species in a cycle */
let i_generate_basic_individual = (species, cycle) => {
    let ind = new i_Individual(species, cycle)
    return ind
}


/** Create an individual for a species in a cycle */
const integrated_generate_individual_with_genome = (species, cycle=0,
    genome_generator) => {
    let ind = i_generate_basic_individual(species, cycle)
    genome_generator(ind)
    return ind
}


const integrated_create_simple_genome = (individual, func) => {
    let species = individual.species
    let genome = species.genome
    let metadata = genome.metadata
    let position = 0
    let genome_buffer = new ArrayBuffer(genome.size)
    let genome_data = new Uint8Array(genome_buffer)
    for (let marker_name of genome.marker_order) {
        let marker = metadata[marker_name]
        let features = marker.markers
        for (let i=0; i<features.length; i++) {
            let possible_values = features[i].possible_values
            genome_data[position + i] = func(possible_values)
        }
        position += marker.size
    }
    individual.genome = genome_data
}


const integrated_create_randomized_genome = (individual) => {
    integrated_create_simple_genome(individual, (possible_values) =>
        utils_random_choice(possible_values))
}


const integrated_create_zero_genome = (individual) => {
    integrated_create_simple_genome(individual, (possible_values) => 0)
}


const integrated_create_freq_genome = (freq, individual) => {
    integrated_create_simple_genome(individual, (possible_values) =>
                                    Math.random() < freq ? 0 : 1)
}


let __integrated_test_val = 0
const integrated_create_test_genome = (individual) => {
    integrated_create_simple_genome(individual, (possible_values) =>
        {return __integrated_test_val++})
}



/** Population module
 *
 * This is a bit more general than "population" genetics. It can
 * generate many models of demography (e.g. landscape)
 *
 * @module population
 */

let p_generate_n_inds = (num_inds, generator) => {
    let inds = []
    for (let i=0; i<num_inds; i++) {
        inds.push(generator())
    }
    return inds
}


/**
 * Assign random population.
 * 
 * Assigns a random population number to all individuals.
 */
const p_assign_random_population = (inds, num_pops) => {
    for (let ind of inds) {
        ind.pop = Math.floor(Math.random() * num_pops)
    }
}

/**
 * Assign individuals to population in sequence.
 * 
 * Not random and allocates as fairly as possible accross populations.
 */
const p_assign_fixed_size_population = (inds, num_pops) => {
    for (let i=0; i<inds.length; i++) {
        inds[i].pop = i % num_pops
    }
}


/**
 * Migrates a fixed number of individuals from a population (Island).
 * 
 * Note that this is still stochastic for the receiving population.
 * Individuals cannot be returned back.
 * 
 */
const p_migrate_island_fixed = (inds, migs_per_pop) => {
    let num_pops = 0
    let pop_inds = {}
    for (let ind of inds) {
        let my_pop = ind.pop
        if (pop_inds[my_pop] === undefined) pop_inds[my_pop] = []
        pop_inds[my_pop].push(ind)
    }
    num_pops = Object.keys(pop_inds).length
    for (let export_pop=0; export_pop<num_pops; export_pop++) {
        for (let ind of pop_inds[export_pop]) {
            while (ind.pop === export_pop) {
                ind.pop = randint(0, num_pops)
            }
        }
    }

}


/**
 * Migrates a fixed number of individuals from a population (Island).
 * The algorithm is fair wrt receiving populations.
 * 
 * Individuals cannot be returned back.
 * 
 */
const p_migrate_island_fixed_fixed = (inds, migs_per_pop) => {
   
}



/** Executes the simulator for a single cycle.
 *
 * @param {state} Start state
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 */
const sim_cycle = (state) => {
    //An operation can change the ops that will execute in
    //the next cycle (but only in the next)
    //Operations should not do inconsistent changes between them...
    for (let operator of state.operators) {
        operator.change(state)
    }
    state.cycle += 1
}

/**
 * Do a async cycle of simulation.
 *
 * One operator will add a stop=true to global_parameters
 *
 * @param {integer} number of cycles
 * @param callback
 */
const sim_do_async_cycle = (state, callback) => {
    //XXX This is not asnyc!
    //XXX doc to review
    sim_cycle(state)
    callback(state)
}

/**
 * Do n cycles of simulation
 *
 * @param {integer} number of cycles
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 */
const sim_do_n_cycles = (num_cycles, state, callback) => {
    //XXX Doc to review
    let add_operators = state.operators.slice()
    add_operators.push(new ops_CycleStopOperator(num_cycles + state.cycle))
    state.operators = add_operators
    state.global_parameters.stop = false
    //XXX The CycleStopOperator should be removed? Probably...
    if (callback) {
        sim_do_async_cycles(state, callback)
    }
    else {
        return sim_do_unspecified_cycles(state)
    }
}


/**
 * Do unspecified cycles of simulation.
 * 
 * One operator will add a stop=true to global_parameters
 *
 * @param {integer} number of cycles
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 */
const sim_do_unspecified_cycles = (state) => {
    //XX Doc to review
    while (state.global_parameters.stop === false) {
        sim_cycle(state)
    }
    return state
}


/**
 * Do async (unspecified) cycles of simulation.
 *
 * One operator will add a stop=true to global_parameters
 *
 * @param {integer} number of cycles
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 * @param callback
 */
const sim_do_async_cycles = (state, callback) => {
    //XXX This is not async!
    //XXX Doc to review
    sim_cycle(state)
    let return_callback
    if (!state.global_parameters.stop) {
        return_callback = sim_do_async_cycles.bind(null, state, callback) 
    }
    callback(state, return_callback)
}



/** A species */
class sp_Species {
    /**
     * A species.
     * @param {string} name
     * @param genome A {@link Genome}
     */
    constructor (name, genome) {
        this.name = name
        this._genome = genome
    }

    get genome() {
        return this._genome
    }
}



const utils_random_choice = (choices) => {
    let pos = Math.floor(Math.random() * choices.length)
    return choices[pos]
}



class ops_BaseOperator {
    /**
     * Operates over global state
     * has: global_parameters, cycle, individuals, operators
     */
    change(state) {
        throw TypeError('This is an abstract method')
    }
}


class ops_CycleStopOperator extends ops_BaseOperator {
    constructor(cycle) {
        super()
        this._cycle = cycle
    }

    change(state) {
         if (state.cycle === this._cycle) {
             state.global_parameters.stop = true
        }
    }
 
}


class ops_RxOperator extends ops_BaseOperator {
    constructor() {
        super()
        this._emitter = new EventEmitter()
        this._observable =  RxO.Observable.fromEvent(this._emitter, 'event')
    }

    change(state) {
        this._emitter.emit('event', state.global_parameters)
    }

    get observable() {
        return this._observable
    }

    subscribe(fun) {
        this._observable.subscribe(fun)
    }
    
}


//Genome statistics should choose markers
class ops_StatisticsOperator extends ops_BaseOperator {
    constructor(name) {
        super()
        this._name = name
    }

    change(state) {
        state.global_parameters[this._name] = this.compute(
            state.global_parameters, state.cycle, state.individuals)
    }
}


class ops_GenomeCountStatistics extends ops_StatisticsOperator {
    compute(global_parameters, cycle, individuals) {
        let species = individuals[0].species
        let genome = species.genome
        let metadata = genome.metadata
        let position = 0
        let counts = {}
        for (let marker_name of genome.marker_order) {
            let marker_counts = []
            let marker = metadata[marker_name]
            let features = marker.markers
            let num_features, start
            if (marker.is_autosomal) {
                num_features = features.length / 2
                start = [0, num_features]
            }
            else {
                num_features = features.length
                start = [0]
            }
            for (let i=0; i < num_features; i++) {
                let feature_counts = {}
                for (let my_start of start) {
                    for (let individual of individuals) {
                        let allele = individual.genome[my_start + position + i]
                        if (allele in feature_counts) {
                            feature_counts[allele] += 1
                        }
                        else {
                            feature_counts[allele] = 1
                        }
                    }
                }
                marker_counts.push(feature_counts)
            }
            position += marker.size
            counts[marker_name] = marker_counts
        }
        return this.compute_counts(counts)
    }
}


/** Remove Older Generations.
  *
 * This will work e.g. for the standrd Wright-Fisher model.
 */
class ops_culling_KillOlderGenerations extends ops_BaseOperator {
    change (state) {
        let individuals = state.individuals
        state.individuals = []
        for (let individual of individuals) {
            if (individual.cycle_born === state.cycle) {
                state.individuals.push(individual)
            }
        }
    }
}


/** Population
 *
 * @module operators/reproduction
 */

class ops_p_MigrationIslandFixedOperator extends ops_BaseOperator {
    /**
     * Creates an instance of MigrationIslandFixedOperator.
     * 
     * Wraps {@link migrate_island_fixed}
     * 
     * @param {any} migs_per_pop migrants per population
     * 
     * @memberOf MigrationIslandFixedOperator
     */
    constructor (migs_per_pop) {
        super()
        this._migs_per_pop = migs_per_pop
    }

    change(state) {
        p_migrate_island_fixed(state.individuals, this._migs_per_pop) 
    }
}


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
class ops_rep_BaseReproduction extends ops_BaseOperator {
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


class ops_rep_ClonalReproduction extends ops_rep_BaseReproduction {
}


class ops_rep_SexualReproduction extends ops_rep_BaseReproduction {
    /**
     * Sexual Reproduction.
     * The generator object will only be constructed with
     *   reproductor (this) and annotators. The rest will be default 
     */
    constructor (species, size, annotators=[],
                 mater_factory=ops_rep_random_mater_factory,
        generator=ops_rep_SexualGenerator) {
        super(species, size, annotators)
        this.mater_factory = mater_factory
        this.generator = generator
    }

    change (state) {
        let mate_individuals = state.individuals.slice()
        let mater = this.mater_factory(this, mate_individuals)
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


class ops_rep_NoGenomeSexualReproduction extends ops_rep_SexualReproduction {
    constructor (species, size, annotators=[],
                 mater_factory=ops_rep_random_mater_factory) {
        super(species, size, annotators,
              mater_factory, ops_rep_NoGenomeSexualGenerator)
    }
}


class ops_rep_StructuredSexualReproduction extends ops_rep_BaseReproduction {
    /**
     * Structured Sexual Reproduction. Population based
     * The generator object will only be constructed with
     *   reproductor (this) and annotators. The rest will be default 
     */
    constructor (species, pop_size, num_pops, annotators=[],
                 mater_factory=ops_rep_random_mater_factory,
        generator=ops_rep_SexualGenerator) {
        super(species, pop_size * num_pops, annotators)
        this.pop_size = pop_size
        this.num_pops = num_pops
        this.mater_factory = mater_factory
        this.generator = generator
        this.deme_reproductor = new ops_rep_SexualReproduction(
            species, pop_size, annotators, mater_factory, generator)
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


class ops_rep_NoGenomeStructuredSexualReproduction
extends ops_rep_StructuredSexualReproduction {
    constructor (species, pop_size, num_pops, annotators=[],
                 mater_factory=ops_rep_random_mater_factory) {
        super(species, pop_size, num_pops, annotators,
              mater_factory, ops_rep_NoGenomeSexualGenerator)
    }
}



//Mating


/**
 * Abstract class for mating systems.
 * 
 */
class ops_rep_Mater {
    constructor (reproductor, individuals) {
        this._reproductor = reproductor
        this._individuals = individuals
    }

    /**
     * Mate method. Returns {mother, father}
     */
    *mate() { // eslint-disable-line require-yield
        throw TypeError('Base class')
    }
}


class ops_rep_RandomMater extends ops_rep_Mater {
    *mate() {
        let wrapper = new ops_rep_WrapperChooser(this._individuals)
        let mother_chooser = new ops_rep_SexChooser(wrapper, true)
        let father_chooser = new ops_rep_SexChooser(wrapper, false)
        let random_mother_choice = new ops_rep_RandomChooser(mother_chooser).choose()
        let random_father_choice = new ops_rep_RandomChooser(father_chooser).choose()
        while (true) {
            yield {
                mother: random_mother_choice.next().value,
                father: random_father_choice.next().value
            }
        }
    }
}


const ops_rep_random_mater_factory = (reproductor, individuals) =>
      new ops_rep_RandomMater(reproductor, individuals)


class ops_rep_AutosomeSNPMater extends ops_rep_Mater {
    //sel: 0 (0,0), 1 (0,1)(1,0), 2(1,1) -> 1 - s
    constructor(reproductor, individuals, sel, marker_name, pos) {
        super(reproductor, individuals)
        const genome = this._individuals[0].species.genome
        this._sel = sel
        const marker = genome.metadata[marker_name]
        const start = genome.get_marker_start(marker_name)
        this._locations = [start + pos, start + marker.markers.length / 2 + pos]
    }

    //XXX Probably better elsewhere
    _get_genome_sum(individual) {
        return individual.genome[this._locations[0]] + individual.genome[this._locations[1]]
    }

    _reproduces(individual) {
        const gsum = this._get_genome_sum(individual)
        return Math.random() < this._sel[gsum]
    }

    *mate() {
        let wrapper = new ops_rep_WrapperChooser(this._individuals)
        let mother_chooser = new ops_rep_SexChooser(wrapper, true)
        let father_chooser = new ops_rep_SexChooser(wrapper, false)
        let random_mother_choice = new ops_rep_RandomChooser(mother_chooser).choose()
        let random_father_choice = new ops_rep_RandomChooser(father_chooser).choose()
        while (true) {
            //not the most efficient
            const mother = random_mother_choice.next().value
            const father = random_father_choice.next().value
            if (this._reproduces(mother) && this._reproduces(father)) {
                yield {mother, father}
            }
        }
    }
}


//parent choosers
class ops_rep_Chooser {
    constructor(source=undefined) {
        this._is_finite = true
        this._source = source
    }

    *choose() {  // eslint-disable-line require-yield
        throw TypeError('Base class')
    }

    get is_finite() {return this._is_finite}
}


class ops_rep_WrapperChooser extends ops_rep_Chooser {
    constructor (individuals) {
        super()
        this._individuals = individuals
    }

    *choose() {
        for (let individual of this._individuals) yield individual
    }
}


class ops_rep_SexChooser extends ops_rep_Chooser {
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


class ops_rep_RandomChooser extends ops_rep_Chooser {
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
class ops_rep_IndividualGenerator {
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


class ops_rep_SexualGenerator extends ops_rep_IndividualGenerator {
    constructor(reproductor, annotators=[],
        assign_sex=true, standard_transmission_genetics=true) {
        let my_annotators = annotators.slice()
        if (standard_transmission_genetics) {
            my_annotators.unshift(ops_rep_transmit_sexual_genome)
        }
        if (assign_sex) {
            my_annotators.unshift((individual, _parents) => {i_assign_random_sex(individual)})
        }
        super(reproductor, my_annotators)
    }

    generate() {
        let individual = i_generate_basic_individual(this._reproductor.species,
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


class ops_rep_NoGenomeSexualGenerator extends ops_rep_SexualGenerator {
    constructor(reproductor, annotators=[],
        assign_sex=true) {
        super(reproductor, annotators, assign_sex, false)
    }
}


// Annotators

function ops_rep_annotate_with_parents(individual, parents) {
    for (let parent of parents) {
        if (parent.is_female) {
            individual.mother = parent.id
        }
        else {
            individual.father = parent.id            
        }
    }
}


function ops_rep_transmit_sexual_genome(individual, parents) {
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

class ops_stats_demo_SexStatistics extends ops_StatisticsOperator {
    constructor(name='SexRatio') {
        super(name)
    }

    compute(global_parameters, cycle, individuals) {
        let males = 0
        let females = 0
        for (let individual of individuals) {
            if (individual.is_female) {
                females += 1
            }
            else {
                males +=1
            }
        }
        return {females,  males}
    }
}


//Number of Distinct Alleles
// 1 = monomorphic site
class ops_stats_NumAl extends ops_GenomeCountStatistics {
    constructor(name='NumAl') {
        super(name)
    }

    compute_counts(counts) {
        const num_al = {}
        for (let marker in counts) {
            const num_al_marker = []
            for (let ft_counts of counts[marker]) {
                let al_cnt = 0
                for (let allele in ft_counts) {
                    if (ft_counts[allele] > 0) {
                        al_cnt += 1
                    }
                }
                num_al_marker.push(al_cnt)
            }
            num_al[marker] = num_al_marker
        }
        return num_al
    }
}


class ops_stats_FreqAllele extends ops_GenomeCountStatistics {
    constructor(name='FreqAllele', allele=1) {
	//allele=1 is typically the derived SNP
        super(name)
	this.allele = allele
    }

    compute_counts(counts) {
        let freq_allele = {}
        for (let marker in counts) {
            let freq_allele_marker = []
            for (let ft_counts of counts[marker]) {
                let all_counts = 0
                for (let allele in ft_counts) {
                    all_counts += ft_counts[allele]
                }
                freq_allele_marker.push(ft_counts[this.allele] / all_counts)
            }
            freq_allele[marker] = freq_allele_marker
        }
        return freq_allele
    }
}


class ops_stats_hz_ExpHe extends ops_GenomeCountStatistics {
    //XXX This versus the estimator....
    constructor(name='ExpHe') {
        super(name)
    }

    compute_counts(counts) {
        let exp_he = {}
        for (let marker in counts) {
            let exp_he_marker = []
            for (let ft_counts of counts[marker]) {
                let dif_cnt = 1.0
                let all_counts = 0
                for (let allele in ft_counts) {
                    all_counts += ft_counts[allele]
                }
                for (let allele in ft_counts) {
                    let f = ft_counts[allele] / all_counts
                    dif_cnt -= f*f
                }
                exp_he_marker.push(dif_cnt)
            }
            exp_he[marker] = exp_he_marker
        }
        return exp_he
    }
}


module.exports.randint = randint

module.exports.gn_Autosome = gn_Autosome
module.exports.gn_Chromosome = gn_Chromosome
module.exports.gn_ChromosomePair = gn_ChromosomePair
module.exports.gn_generate_unlinked_genome = gn_generate_unlinked_genome
module.exports.gn_Genome = gn_Genome
module.exports.gn_Marker = gn_Marker
module.exports.gn_SNP = gn_SNP
module.exports.gn_Mito = gn_Mito
module.exports.gn_MicroSatellite = gn_MicroSatellite
module.exports.gn_UnlinkedAutosome = gn_UnlinkedAutosome
module.exports.gn_LinkedAutosome = gn_LinkedAutosome
module.exports.gn_XChromosome = gn_XChromosome
module.exports.gn_YChromosome = gn_YChromosome

module.exports.i_assign_random_sex = i_assign_random_sex
module.exports.i_generate_basic_individual = i_generate_basic_individual
module.exports.i_Individual = i_Individual

module.exports.integrated_create_randomized_genome = integrated_create_randomized_genome
module.exports.integrated_create_test_genome = integrated_create_test_genome
module.exports.integrated_create_freq_genome = integrated_create_freq_genome
module.exports.integrated_create_zero_genome = integrated_create_zero_genome
module.exports.integrated_generate_individual_with_genome = integrated_generate_individual_with_genome

module.exports.ops_BaseOperator = ops_BaseOperator
module.exports.ops_CycleStopOperator = ops_CycleStopOperator
module.exports.ops_RxOperator = ops_RxOperator
module.exports.ops_culling_KillOlderGenerations = ops_culling_KillOlderGenerations
module.exports.ops_p_MigrationIslandFixedOperator = ops_p_MigrationIslandFixedOperator
module.exports.ops_rep_annotate_with_parents = ops_rep_annotate_with_parents
module.exports.ops_rep_BaseReproduction = ops_rep_BaseReproduction
module.exports.ops_rep_ClonalReproduction = ops_rep_ClonalReproduction
module.exports.ops_rep_NoGenomeSexualGenerator = ops_rep_NoGenomeSexualGenerator
module.exports.ops_rep_NoGenomeSexualReproduction = ops_rep_NoGenomeSexualReproduction
module.exports.ops_rep_NoGenomeStructuredSexualReproduction = ops_rep_NoGenomeStructuredSexualReproduction
module.exports.ops_rep_RandomChooser = ops_rep_RandomChooser
module.exports.ops_rep_RandomMater = ops_rep_RandomMater
module.exports.ops_rep_AutosomeSNPMater = ops_rep_AutosomeSNPMater
module.exports.ops_rep_SexChooser = ops_rep_SexChooser
module.exports.ops_rep_SexualGenerator = ops_rep_SexualGenerator
module.exports.ops_rep_SexualReproduction = ops_rep_SexualReproduction
module.exports.ops_rep_transmit_sexual_genome = ops_rep_transmit_sexual_genome
module.exports.ops_rep_WrapperChooser = ops_rep_WrapperChooser
module.exports.ops_stats_demo_SexStatistics = ops_stats_demo_SexStatistics
module.exports.ops_stats_NumAl = ops_stats_NumAl
module.exports.ops_stats_FreqAllele = ops_stats_FreqAllele
module.exports.ops_stats_hz_ExpHe = ops_stats_hz_ExpHe

module.exports.p_assign_fixed_size_population = p_assign_fixed_size_population
module.exports.p_assign_random_population = p_assign_random_population
module.exports.p_generate_n_inds = p_generate_n_inds
module.exports.p_migrate_island_fixed = p_migrate_island_fixed
module.exports.p_migrate_island_fixed_fixed = p_migrate_island_fixed_fixed

module.exports.sim_cycle = sim_cycle
module.exports.sim_do_async_cycle = sim_do_async_cycle
module.exports.sim_do_async_cycles = sim_do_async_cycles
module.exports.sim_do_n_cycles = sim_do_n_cycles

module.exports.sp_Species = sp_Species
