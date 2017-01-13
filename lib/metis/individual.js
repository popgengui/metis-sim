/** Representing an individual
 *
 * @module individual
 */


let _id = 0

/** A individual */
export class Individual {
    /**
     * Create an individual
     * @param {Species} species
     * @param {Species} cycle_born When the individual was born
     *
     * The individual will be assigned a unique ID and will be alive.
     */
    constructor (species, cycle_born=0) {
        this.id = Individual.id
        this.species = species
        this._alive = true
        this.cycle_born = cycle_born
    }

    static get id() {
        return _id ++
    }

    get alive() {
        return this._alive
    }
}

export let generate_basic_individual = (species, cycle, genome_generator) => {
    return new Individual(species, cycle)
}

/** Assigns a random sex to an individual.
 *
 * This is done by a is_female attribute
 */
export let assign_random_sex = (individual) => {
    individual.is_female = Math.random() >= .5
    return individual
}
