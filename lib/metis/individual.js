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
        this._id = Individual.global_id
        this.species = species
        this._alive = true
        this.cycle_born = cycle_born
    }

    static get global_id() {
        return _id ++
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
export let assign_random_sex = (individual) => {
    individual.is_female = Math.random() >= .5
    return individual
}

/** Create an individual for a species in a cycle */
export let generate_basic_individual = (species, cycle) => {
    let ind = new Individual(species, cycle)
    return ind
}