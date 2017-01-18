import * as individual from '../lib/metis/individual.js'
import * as population from '../lib/metis/population.js'
import * as species from '../lib/metis/species.js'

export let empty_species = new species.Species('empty', undefined)

export let generate_n_basic_individuals = (n, cycle=0) => {
    return population.generate_n_inds(n,
        () => individual.generate_basic_individual(empty_species, cycle))
}
