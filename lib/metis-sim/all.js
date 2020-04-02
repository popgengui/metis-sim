const EventEmitter = require('events').EventEmitter
const RxO = require('rxjs')


/** Stuff that JavaScript should have, but doesn't.
    Move somewhere else (other library) */
const randint = (a, b) => {
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return Math.floor(Math.random() * (max - min)) + min  
}

const random_choice = (choices) => {
    let pos = Math.floor(Math.random() * choices.length)
    return choices[pos]
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

    distance(pos) {
        return this._distances ? this._distances[pos] : null
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

    reproduce(ofs, parent, ofs_position, parent_position) {
        for (let i=0; i < this._size; i++) {
            ofs.genome[ofs_position + i] = parent.genome[parent_position + i]
        }
    }
}


/**
 * An Autosome.
 */
class gn_Autosome {
}


class gn_AutosomeSNP {
    constructor (possible_values=[0, 1]) {
        this.SNP = new gn_SNP()
        this._size = 2
    }
    
    get size() {
        return this._size
    }

    reproduce(individual, parents, position) {
        this.SNP.reproduce(individual, parents[0],
                        position, position)
        this.SNP.reproduce(individual, parents[1],
                        position + this.size / 2, position)
    }


    get markers() {
        let base_markers = [this.SNP, this.SNP]
        return base_markers
    }

    get is_autosomal() {
        return true
    }
}



/**
 * Chromosome pair.
 *
 * This currently implements UNLINKED markers
 * Changes need to be made here to support linkage
 * Note that genomic distances are in this.chromosome
 */
class gn_ChromosomePair {
    constructor (markers, distances=null) {
        this.chromosome = new gn_Chromosome(markers, distances)
    }
    
    get size() {
        return 2 * this.chromosome.size
    }

    recombine_parent(ofs, parent, ofs_position, position) {
        let parent_position = 0
        for (let i=0; i < this.chromosome.size; i++) {
            const distance = this.chromosome.distance(i)  
            const prob =  distance?
                  (1 - Math.exp(-2*distance / 100))/2 :
                  0.5
            const swap = Math.random() < prob
            parent_position = parent_position -
                  (swap?
                   this.chromosome.size :
                   0)
            parent_position = Math.abs(parent_position)
            ofs.genome[ofs_position + i] = parent.genome[parent_position + i]
        }
    }
    
    reproduce(ofs, parents, position) {
        //console.log(111, individual.genome, this.size, parents) //eslint-disable-line no-console
        this.recombine_parent(ofs, parents[0], position, position)
        this.recombine_parent(ofs, parents[1],
                              position + this.chromosome.size, position)
    }


    get markers() {
        const base_markers = this.chromosome.markers.slice()
        return base_markers.concat(base_markers)
    }

    get is_autosomal() {
        return true
    }
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
    for (let i=0; i < num_markers; i++) {
        markers.push(marker_generator())
    }
    metadata.unlinked = new gn_ChromosomePair(markers)
    return new gn_Genome(metadata)
}

/*Ted adds 20200307, to simplify tracking time-to-fixation
 * We use -1 in the cycle-at-fixation array to indicate
 * that we don't know if the marker is fixed*/
const gn_make_cum_marker_stats_holder = ( num_markers ) => {
	let cum_marker_stats={}
	let cycle_at_fix_per_exphe = []
	let cycle_at_fix_per_freqal=[]
	let cycle_at_loss_per_freqal=[]

	for (let i=0; i < num_markers; i++ ) {
		cycle_at_fix_per_exphe.push( -1 )
		cycle_at_fix_per_freqal.push( -1 )
		cycle_at_loss_per_freqal.push( -1 )
	}

	cum_marker_stats.cycle_at_fix_per_exphe=cycle_at_fix_per_exphe
	cum_marker_stats.cycle_at_fix_per_freqal=cycle_at_fix_per_freqal
	cum_marker_stats.cycle_at_loss_per_freqal=cycle_at_loss_per_freqal

	cum_marker_stats.total_fixed_exphe=0
	cum_marker_stats.total_fixed_freqal=0
	cum_marker_stats.total_lost_freqal=0

	return cum_marker_stats
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


/** Assigns a sex based on a prob of being male */
const i_assign_perc_male = (individual, frac) => {
    individual.is_female = Math.random() >= frac
    return individual
}


/** Assigns a random sex to an individual */
const i_assign_random_sex = (individual) => i_assign_perc_male(individual, 0.5)


/** Assigns a sex to an individual based on sex ratio*/
const i_assign_sex_ratio = (individual, sr) => {
    const fm = sr / (1 + sr)
    return i_assign_perc_male(individual, fm)
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
        for (let i=0; i < features.length; i++) {
            let possible_values = features[i].possible_values
            genome_data[position + i] = func(possible_values)
        }
        position += marker.size
    }
    individual.genome = genome_data
}


const integrated_create_randomized_genome = (individual) => {
    integrated_create_simple_genome(individual, (possible_values) =>
        random_choice(possible_values))
}


const integrated_create_zero_genome = (individual) => {
    integrated_create_simple_genome(individual, (possible_values) => 0)
}


const integrated_create_freq_genome = (freq, individual) => {
    integrated_create_simple_genome(individual, (possible_values) =>
                                    Math.random() < freq ? 0 : 1)
}

/* 2019_11_06 Ted adds a new genome creator using an initial freq, and
 * computes for either snp (2 alleles) or microsat (with m alleles). In the latter case, 
 * with freq 0 <= f <= 1.0, the first allele is selected with prob f, the 
 * rest with prob ( 1-f )/(m-1) */
  
const integrated_create_freq_genome_snp_or_microsat = ( freq, individual ) => {
    integrated_create_simple_genome( individual, (possible_values) => {

	    let num_poss_vals=possible_values.length 

	    if ( num_poss_vals < 2 )
	    {
		    if ( num_poss_vals < 1 )
		    {

        		throw RangeError('This individual has no possible_values for a marker' )
		    }
		    else
		    {
			    return possible_values[0]
		    }
	    }

	    let randomNr=Math.random()

	    /*Equal probability for selecting allele 2,3..N, 
	     *N = total num alleles*/
	    let non_first_allele_freq = ( 1-freq )/( num_poss_vals - 1 ) 
	   
	    cumulative_non_first_allele_prob=(num_poss_vals-1)*non_first_allele_freq
	 
	    if ( randomNr > cumulative_non_first_allele_prob )
	    {
		    /*return the allele with prob freq*/
		    return possible_values[ 0 ]
	    }
	    else
	    {
		    /*find the ith allele with non-first-allele prob by seeing how many
		     *units of the non-first-allele prob our rand() contains */
		    total_non_first_allele_probs_contained_in_rand = Math.ceil( randomNr/non_first_allele_freq )
		    return possible_values[ total_non_first_allele_probs_contained_in_rand ]
	    }//end if rand greater than cum non-first allele probs, else find non-first-allele index

    })

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

let p_generate_n_inds = (num_inds, generator, tweak_teaching=true) => {
    let inds = []
    for (let i=0; i < num_inds; i++) {
        inds.push(generator())
    }
    if ((inds.length >1) && tweak_teaching) {
        inds[0].is_female = true
        inds[1].is_female = false
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
    for (let i=0; i < inds.length; i++) {
        inds[i].pop = i % num_pops
    }
}


/**
 * Migrates a fixed number of individuals from a population (Island).
 * 
 * This is "fair" in the sense that x individuals are removed from
 * a population and x individuals are inserted.
 * An individual is not returned back to the same population.
 * 
 */
const p_migrate_island_fixed = (inds, migs_per_pop) => {
    const pop_inds = {}
    for (let ind of inds) {
        let my_pop = ind.pop
        if (pop_inds[my_pop] === undefined) pop_inds[my_pop] = []
        pop_inds[my_pop].push(ind)
    }
    const num_pops = Object.keys(pop_inds).length

    for (let export_pop=0; export_pop < num_pops; export_pop++) {
        const my_inds = pop_inds[export_pop]
        const pop_ninds = my_inds.length
        for (let case_ind=0; case_ind < migs_per_pop; case_ind++) {
            let done = false
            while (!done) {
                const move_ind = my_inds[randint(0, pop_ninds)]
                if (move_ind.pop != export_pop) {
                    continue
                }
                let receiving_pop = randint(0, num_pops)
                while (receiving_pop === export_pop) {
                    receiving_pop = randint(0, num_pops)
                }
                move_ind.pop = receiving_pop
                done = true
            }
        }
    }
}



/**
 * Migrates a fixed number of individuals from a population
 * 1 or 2 stepping stone
 * 
 * This is "fair" in the sense that x individuals are removed from
 * a population and x individuals are inserted.
 * An individual is not returned back to the same population.
 * d1 - dimension 1
 * d2 - dimension 2
 * individual.pops has to vary between 0 and d1*d2-1
 * 
 */
const p_migrate_stepping_stone_fixed = (inds, migs_to_neighbor, d1, d2) => {
    const get_coord = (index) => {
        return [Math.floor(index/d2), index % d2]  
    }
    const get_index = (y, x) => y*d2 + x

    const pop_inds = {}
    for (let ind of inds) {
        let my_pop = ind.pop
        if (pop_inds[my_pop] === undefined) pop_inds[my_pop] = []
        pop_inds[my_pop].push(ind)
    }
    const num_pops = d1*d2

    for (let export_pop=0; export_pop < num_pops; export_pop++) {
        const my_coord = get_coord(export_pop)
        const my_inds = pop_inds[export_pop]
        const pop_ninds = my_inds.length
        for (let dy=-1; dy < 2; dy++) {
            const receiving_y = my_coord[0] + dy
            if (receiving_y < 0 || receiving_y >= d1) continue
            for (let dx=-1; dx < 2; dx++) {
                if (dx == 0 && dy == 0) continue
                const receiving_x = my_coord[1] + dx
                if (receiving_x < 0 || receiving_x >= d2) continue
                const receiving_pop = get_index(receiving_y, receiving_x)
                let done = false
                while (!done) {
                    const move_ind = my_inds[randint(0, pop_ninds)]
                    if (move_ind.pop != export_pop) continue
                    move_ind.pop = receiving_pop
                    done = true
                }
            }
        }
    }
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
        operator().change(state)
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
    add_operators.push(
        ops_wrap(new ops_CycleStopOperator(num_cycles + state.cycle)))
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


const ops_wrap = (op) => () => op


const ops_wrap_list = (ops) => ops.map((op) => () => op)


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
        this._state = state
        state.global_parameters[this._name] = this.compute()
    }
}


class ops_DemeStatistics extends ops_StatisticsOperator {
    constructor(name, stats_factory) {
        //eg for stats_factory  = (x) => new x()
        super('Deme' + name)
        this._stat = stats_factory()
    }

    compute() {
        const pop_individuals = {}
        const stat_pop = {}
        for (let individual of this._state.individuals) {
            const pop = individual.pop
            if (!(pop in pop_individuals)) {
                pop_individuals[pop] = []
            }
            pop_individuals[pop].push(individual)
        }
        for (let pop in pop_individuals) {
            const mock_state = {
                individuals: pop_individuals[pop],
                genome: this._state.genome,
                cycle: this._state.cycle,
                global_parameters: {}
            }
            this._stat.change(mock_state)
            for (let stat_name in mock_state.global_parameters) {
                //There should be only one
                stat_pop[pop] = mock_state.global_parameters[stat_name]
            }

        }
        return stat_pop
    }
}


class ops_GenomeCountStatistics extends ops_StatisticsOperator {
    compute() {
        const individuals = this._state.individuals
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
 * @module operators/population
 */

class ops_p_MigrationIslandFixed extends ops_BaseOperator {
    /**
     * Creates an instance of MigrationIslandFixed.
     * 
     * Wraps {@link p_migrate_island_fixed}
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


class ops_p_MigrationSteppingStoneFixed extends ops_BaseOperator {
    /**
     * Creates an instance of MigrationSteppingStoneFixed.
     * 
     * Wraps {@link p_migrate_stepping_stone_fixed}
     * 
     */
    constructor (migs_to_neighbor, d1, d2) {
        super()
        this._migs_to_neighbor
        this._d1 = d1
        this._d2 = d2
    }

    change(state) {
        p_migrate_stepping_stone_fixed(state.individuals, this._migs_per_pop,
                                       this._d1, this._d2) 
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
     *
     * Note: this can do asexual reproduction with the proper mater,
     *       name is not appropriate
     */
    constructor (species, size, annotators=[],
                 mater_factory=ops_rep_random_mater_factory,
                 generator_factory=ops_rep_sexual_generator_factory,
                 tweak_teaching=true) {
        super(species, size, annotators)
        this.mater_factory = mater_factory
        this.generator_factory = generator_factory
	this.tweak_teaching = tweak_teaching
    }

    change (state) {
        let mate_individuals = state.individuals.slice()
	let mater = this.mater_factory(this, mate_individuals).mate()
        this.cycle = state.cycle
        let generator = this.generator_factory(this, this.annotators)
        for (let i=0; i < this._size; i++) {
            let parents = mater.next().value
            generator.mother = parents.mother
            generator.father = parents.father
            state.individuals.push(generator.generate())
            if ((i < 2) && this.tweak_teaching) {
                state.individuals[state.individuals.length - 1].is_female = i==0
            }
        }
    }
}


class ops_rep_NoGenomeSexualReproduction extends ops_rep_SexualReproduction {
    constructor (species, size, annotators=[],
                 mater_factory=ops_rep_random_mater_factory,
                 generator_factory=ops_rep_no_genome_sexual_generator_factory) {
        super(species, size, annotators,
              mater_factory, generator_factory)
    }
}


class ops_rep_StructuredSexualReproduction extends ops_rep_BaseReproduction {
    /**
     * Structured Sexual Reproduction. Population based
     * The generator object will only be constructed with
     *   reproductor (this) and annotators. The rest will be default 
     */
    constructor (species, deme_size, num_pops, annotators=[],
                 mater_factory=ops_rep_random_mater_factory,
                 generator_factory=ops_rep_sexual_generator_factory) {
        super(species, deme_size * num_pops, annotators)
        this.deme_size = deme_size
        this.num_pops = num_pops
        this.mater_factory = mater_factory
        this.deme_reproductor = new ops_rep_SexualReproduction(
            species, deme_size, annotators, mater_factory, generator_factory)
    }

    change (state) {
        let pop_individuals = []
        for (let pop=0; pop < this.num_pops; pop++) {
            pop_individuals.push([])
        }
        for (let individual of state.individuals) {
            pop_individuals[individual.pop].push(individual)

        }
        for (let pop=0; pop < this.num_pops; pop++) {
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
    constructor (species, deme_size, num_pops, annotators=[],
                 mater_factory=ops_rep_random_mater_factory) {
        super(species, deme_size, num_pops, annotators,
              mater_factory, ops_rep_no_genome_sexual_generator_factory)
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


/** 
 * Sexual Random Mater.
 *
 * Supports population structure
 */
class ops_rep_RandomMater extends ops_rep_Mater {
    *mate() {
        const wrapper = new ops_rep_WrapperChooser(this._individuals)
        const mother_chooser = new ops_rep_SexChooser(wrapper, true)
        const father_chooser = new ops_rep_SexChooser(wrapper, false)
        const random_mother_choice = new ops_rep_RandomChooser(mother_chooser).choose()
        const random_father_choice = new ops_rep_RandomChooser(father_chooser).choose()

        while (true) {
            yield {
                mother: random_mother_choice.next().value,
                father: random_father_choice.next().value
            }
        }
    }
}


/* Alpha mater
 * One random individual is responsible for a fraction of all offspring
 */
class ops_rep_AlphaMater extends ops_rep_Mater {
    constructor(reproductor, individuals, frac_alpha) {
        super(reproductor, individuals)
        this._frac_alpha = frac_alpha
    }
    
    *mate() {
        const wrapper = new ops_rep_WrapperChooser(this._individuals)
        const mother_chooser = new ops_rep_SexChooser(wrapper, true)
        const father_chooser = new ops_rep_SexChooser(wrapper, false)
        const random_mother_choice = new ops_rep_RandomChooser(mother_chooser).choose()
        const random_father_choice = new ops_rep_RandomChooser(father_chooser).choose()
        const alpha_male = random_father_choice.next().value

        while (true) {
            yield {
                mother: random_mother_choice.next().value,
                father: Math.random() < this._frac_alpha?
                    alpha_male :
                    random_father_choice.next().value
            }
        }
    }
}


const ops_rep_random_mater_factory = (reproductor, individuals) =>
      new ops_rep_RandomMater(reproductor, individuals)


const ops_rep_alpha_sire_factory = (frac_alpha) => (reproductor, individuals) =>
      new ops_rep_AlphaMater(reproductor, individuals, frac_alpha)


class ops_rep_AsexualRandomMater extends ops_rep_Mater {
    *mate() {
        let wrapper = new ops_rep_WrapperChooser(this._individuals)
        let random_mother_choice = new ops_rep_RandomChooser(wrapper).choose()
        let random_father_choice = new ops_rep_RandomChooser(wrapper).choose()
        while (true) {
            yield {
                mother: random_mother_choice.next().value,
                father: random_father_choice.next().value
            }
        }
    }
}


const ops_rep_asexual_random_mater_factory = (reproductor, individuals) =>
      new ops_rep_AsexualRandomMater(reproductor, individuals)


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
                sex_assigner=i_assign_random_sex,
                standard_transmission_genetics=true) {

        let my_annotators = annotators.slice()
        if (standard_transmission_genetics) {
            my_annotators.unshift(ops_rep_transmit_sexual_genome)
        }
        if (sex_assigner) {
            my_annotators.unshift((individual, _parents) =>
                                  sex_assigner(individual))
        }
        super(reproductor, my_annotators)
    }

    generate() {
        let individual = i_generate_basic_individual(this._reproductor.species,
            this._reproductor.cycle)
        if (this._mother.hasOwnProperty('pop')){
            individual.pop = this._mother.pop
            //XXX Above should come via annotator
        }
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


const ops_rep_sexual_generator_factory = (reproductor, annotators) =>
      new ops_rep_SexualGenerator(reproductor, annotators)


const ops_rep_sex_ratio_sexual_generator_factory = (ratio) => {
    return (reproductor, annotators) =>
        new ops_rep_SexualGenerator(reproductor, annotators,
                                    (i) => i_assign_sex_ratio(i, ratio))
}


class ops_rep_NoGenomeSexualGenerator extends ops_rep_SexualGenerator {
    constructor(reproductor, annotators=[],
        sex_assigner=i_assign_random_sex) {
        super(reproductor, annotators, sex_assigner, false)
    }
}


const ops_rep_no_genome_sexual_generator_factory = (reproductor, annotators) =>
      new ops_rep_NoGenomeSexualGenerator(reproductor, annotators)


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

    compute() {
        const individuals = this._state.individuals
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


class ops_stats_FreqAl extends ops_GenomeCountStatistics {
    /* 2020_03_23.  Ted added new class member
     * doMean, boolean, default false, if set
     * to true, then a mean allele frequency is computed
     * in compute_counts, and the value is appeneded
     * to the returned array.
     */
    constructor( doMean=false, name='FreqAl', allele=1 ) {
        //allele=1 is typically the derived SNP
        super(name)
        this.allele = allele
	this.computeMean = doMean
    }

    compute_counts(counts) {

	let mean_allele_freq=0.0
	let count_of_allele_freqs=0.0

        let freq_allele = {}
        for (let marker in counts) {
            let freq_allele_marker = []
            for (let ft_counts of counts[marker]) {
                let all_counts = 0
                for (let allele in ft_counts) {
                    all_counts += ft_counts[allele]
                }
		
		let this_freq=(ft_counts[this.allele] || 0) / all_counts
		
                freq_allele_marker.push( this_freq )

		if ( this.computeMean === true )
		{
			count_of_allele_freqs ++
			mean_allele_freq += this_freq
		}//end if compute mean
	
            }

	    if( this.computeMean === true )
	    {
		    mean_allele_freq /= count_of_allele_freqs
		    freq_allele_marker.push( mean_allele_freq )
	    }

            freq_allele[marker] = freq_allele_marker

        }
        return freq_allele
    }
}


class ops_stats_hz_ExpHe extends ops_GenomeCountStatistics {
    //XXX This versus the estimator....

    /* 2019_10_24.  Ted added new class member
     * doMean, boolean, default false, if set
     * to true, then a mean expected het is computed
     * in compute_counts, and the value is appeneded
     * to the returned array.
     */
    constructor( doMean=false, name='ExpHe' ) {
        super(name)
	this.computeMean=doMean
    }

    compute_counts(counts) {

	/*20191020, Ted adds a mean 
	 * expected het for each cycle */
	let mean_exp_he=0
	let count_of_exp_he=0
	    
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

		/* 20191020, now adding the mean exp het
		 * for each cycle only if the costructor
		 * flag was set by client, to "true"*/
		if( this.computeMean === true )
	        {
			mean_exp_he += dif_cnt
			count_of_exp_he += 1
	        }

                exp_he_marker.push(dif_cnt)
            }

	    /* 20191020 Ted adds the mean expected
	     * Het for the cycle, and pushes it onto
	     * the list of values.  In modules that use
	     * this value, then, the last marker plotted
	     * will be the mean.*/
	    if( this.computeMean === true )
	    {
		    mean_exp_he /= count_of_exp_he
		    exp_he_marker.push( mean_exp_he )
	    }

	    exp_he[marker] = exp_he_marker
        }
        return exp_he
    }
}

/* 2019_10_24.  Ted added arg for constructor, 
 * which is passed by this class instance to
 * ops_stats_hz_ExpHe, to set true or false,
 * whether to copmpute and return a mean expected
 * het.
 */
class ops_stats_hz_ExpHeDeme extends ops_DemeStatistics {
    constructor( doMean=false ) {
        super('ExpHe', () => new ops_stats_hz_ExpHe( doMean ))
    }
}

/*20200307 Ted replaced this class with an object (see
 * gn_make_cum_marker_stats_holder, above) that
 * calling mods can add to state, and more simply track
 * which markers have or haven't yet been fixed*/

/*class ops_stats_TimeFix extends ops_GenomeCountStatistics {
    //Cycles to fixation
    constructor(name='TimeFix') {
        super(name)
    }

    compute_counts(counts) {
        const prev_time = this._state.global_parameters[this._name]
        let prev_fix = {}
        if (!prev_time) {
            for (let marker in counts) {
                prev_fix[marker] = Array.apply(
                    null, Array(counts[marker].length)).map(() => {}) 
            }
        }
        else {
            prev_fix = prev_time
        }
        const time_fix = {}
        for (let marker in counts) {
            const time_fix_marker = prev_fix[marker]
            for (let pos=0; pos < counts[marker].length; pos++) {
                if (time_fix_marker[pos] != undefined) {
                    continue
                }
                let all_counts = 0
                for (let allele in counts[marker][pos]) {
                    all_counts += counts[marker][pos][allele]
                }               
                for (let allele in counts[marker][pos]) {

                    if (all_counts === counts[marker][pos][allele]) {
                        time_fix_marker[pos] = this._state.cycle
                    }
		    else {
			    time_fix_marker[pos] = "NA"
		    }

                }               

            }
            time_fix[marker] = time_fix_marker
        }
        return time_fix
    }
}
*/

class ops_stats_utils_SaveGenepop extends ops_StatisticsOperator {
    // This will return an in-memory string. Not memory efficient!
    // Implemented as a stats operator
    // XXX currently assumes full diploidy
    constructor() {
        super('SaveGenepop')
        this._text = ''
    }

    _generate_header() {
        this._text += "Header" + encodeURIComponent( "\n" )
        const genome = this._state.individuals[0].species.genome
        const metadata = genome.metadata
        //console.log(genome, metadata) // eslint-disable-line no-console
        for (let marker_name of genome.marker_order) {
            const marker = metadata[marker_name]
            for (let feature=0; feature < marker.size/2; feature++) {
                this._text += marker_name + "_" + feature + encodeURIComponent( "\n" )
            }
        }
    }

    _generate_pops() {
        const individuals = this._state.individuals
        const pop_inds = {}
        //This works even for undefined
        for (let individual of individuals) {
            const pop = individual.pop
            if (!(pop in pop_inds)) {
                pop_inds[pop] = []
            }
            pop_inds[pop].push(individual)
        }
        var ind_count = 0
        for (let pop in pop_inds) {
            this._text += "pop" + encodeURIComponent("\n")
            for (let individual of pop_inds[pop]) {
                this._text += 'ind_' + (ind_count++) + ' , '
                const size = individual.genome.length
                //console.log(individual.genome) // eslint-disable-line no-console
                for (let pos=0; pos < size/2; pos++) {
                    if (pos != 0) {
                        this._text += ' '
                    }
                    this._text += ('' + ( individual.genome[pos]  + 1 ) ).padStart(3, 0)
                    this._text += ('' + ( individual.genome[pos + size/2]+1)).padStart(3, 0)
                }
                this._text += encodeURIComponent( "\n" )
            }
        }
    }

    compute() {
        this._text = ''
        this._generate_header()
        this._generate_pops()
        return this._text
    }
}


const expt = module.exports 

expt.randint = randint

expt.gn_Autosome = gn_Autosome
expt.gn_AutosomeSNP = gn_AutosomeSNP
expt.gn_Chromosome = gn_Chromosome
expt.gn_ChromosomePair = gn_ChromosomePair
expt.gn_generate_unlinked_genome = gn_generate_unlinked_genome

/*20200307, Ted adds*/
expt.gn_make_cum_marker_stats_holder = gn_make_cum_marker_stats_holder

expt.gn_Genome = gn_Genome
expt.gn_Marker = gn_Marker
expt.gn_SNP = gn_SNP
expt.gn_Mito = gn_Mito
expt.gn_MicroSatellite = gn_MicroSatellite
expt.gn_UnlinkedAutosome = gn_UnlinkedAutosome
expt.gn_LinkedAutosome = gn_LinkedAutosome
expt.gn_XChromosome = gn_XChromosome
expt.gn_YChromosome = gn_YChromosome

expt.i_assign_random_sex = i_assign_random_sex
expt.i_assign_perc_male = i_assign_perc_male
expt.i_generate_basic_individual = i_generate_basic_individual
expt.i_Individual = i_Individual

expt.integrated_create_randomized_genome = integrated_create_randomized_genome
expt.integrated_create_test_genome = integrated_create_test_genome
expt.integrated_create_freq_genome = integrated_create_freq_genome

/*2019_11_07. Ted adds a genome creator to allow an init freq of derived allele
 *for both SNPs and microsats.  This to add an init freq param to the
 *wright-fisher with sex simulation.
 */
expt.integrated_create_freq_genome_snp_or_microsat = integrated_create_freq_genome_snp_or_microsat
expt.integrated_create_zero_genome = integrated_create_zero_genome
expt.integrated_generate_individual_with_genome = integrated_generate_individual_with_genome

expt.ops_wrap = ops_wrap
expt.ops_wrap_list = ops_wrap_list
expt.ops_BaseOperator = ops_BaseOperator
expt.ops_CycleStopOperator = ops_CycleStopOperator
expt.ops_DemeStatistics = ops_DemeStatistics
expt.ops_RxOperator = ops_RxOperator
expt.ops_culling_KillOlderGenerations = ops_culling_KillOlderGenerations
expt.ops_p_MigrationIslandFixed = ops_p_MigrationIslandFixed
expt.ops_p_MigrationSteppingStoneFixed = ops_p_MigrationSteppingStoneFixed
expt.ops_rep_annotate_with_parents = ops_rep_annotate_with_parents
expt.ops_rep_alpha_sire_factory = ops_rep_alpha_sire_factory
expt.ops_rep_BaseReproduction = ops_rep_BaseReproduction
expt.ops_rep_ClonalReproduction = ops_rep_ClonalReproduction
expt.ops_rep_NoGenomeSexualGenerator = ops_rep_NoGenomeSexualGenerator
expt.ops_rep_NoGenomeSexualReproduction = ops_rep_NoGenomeSexualReproduction
expt.ops_rep_NoGenomeStructuredSexualReproduction = ops_rep_NoGenomeStructuredSexualReproduction
expt.ops_rep_RandomChooser = ops_rep_RandomChooser
expt.ops_rep_RandomMater = ops_rep_RandomMater
expt.ops_rep_AsexualRandomMater = ops_rep_AsexualRandomMater
expt.ops_rep_AutosomeSNPMater = ops_rep_AutosomeSNPMater
expt.ops_rep_SexChooser = ops_rep_SexChooser
expt.ops_rep_SexualGenerator = ops_rep_SexualGenerator
expt.ops_rep_SexualReproduction = ops_rep_SexualReproduction
expt.ops_rep_StructuredSexualReproduction = ops_rep_StructuredSexualReproduction
expt.ops_rep_transmit_sexual_genome = ops_rep_transmit_sexual_genome
expt.ops_rep_WrapperChooser = ops_rep_WrapperChooser
expt.ops_rep_asexual_random_mater_factory = ops_rep_asexual_random_mater_factory
expt.ops_rep_sex_ratio_sexual_generator_factory = ops_rep_sex_ratio_sexual_generator_factory
expt.ops_rep_no_genome_sexual_generator_factory = ops_rep_no_genome_sexual_generator_factory
expt.ops_stats_demo_SexStatistics = ops_stats_demo_SexStatistics
expt.ops_stats_NumAl = ops_stats_NumAl
expt.ops_stats_FreqAl = ops_stats_FreqAl
expt.ops_stats_hz_ExpHe = ops_stats_hz_ExpHe
expt.ops_stats_hz_ExpHeDeme = ops_stats_hz_ExpHeDeme
/*Deprecated (see above)
expt.ops_stats_TimeFix = ops_stats_TimeFix
*/
expt.ops_stats_utils_SaveGenepop = ops_stats_utils_SaveGenepop

expt.p_assign_fixed_size_population = p_assign_fixed_size_population
expt.p_assign_random_population = p_assign_random_population
expt.p_generate_n_inds = p_generate_n_inds
expt.p_migrate_island_fixed = p_migrate_island_fixed

expt.sim_cycle = sim_cycle
expt.sim_do_async_cycle = sim_do_async_cycle
expt.sim_do_async_cycles = sim_do_async_cycles
expt.sim_do_n_cycles = sim_do_n_cycles

expt.sp_Species = sp_Species
