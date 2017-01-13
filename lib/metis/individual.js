/** Representing an individual
 *
 * @module individual
 */


let _id = 0

/** A individual */
export class Individual {
    /**
     * Create an individual
     * @param {Species} species - the species
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

export let generate_basic_individual = (species, genome_generator) => {
    return new Individual(species)
}


export let assign_random_sex = (individual) => {
    individual.is_female = Math.random() >= .5
    return individual
}
