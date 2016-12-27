/** Representing an individual
 *
 * @module individual
 */


let _id = 0

export class Individual {
    constructor (species, id) {
        this.id = id ? id : Individual.id
        this.species = species
    }

    static get id() {
        return _id ++
    }
}

export let generate_basic_individual = (species, genome_generator) => {
    return new Individual(species)
}
