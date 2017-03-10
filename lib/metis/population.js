/** Population module
 *
 * This is a bit more general than "population" genetics. It can
 * generate many models of demography (e.g. landscape)
 *
 * @module population
 */

import {randint, sample} from '@tiagoantao/pyes6/dist/random'

export let generate_n_inds = (num_inds, generator) => {
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
export let assign_random_population = (inds, num_pops) => {
    for (let ind of inds) {
        ind.pop = Math.floor(Math.random() * num_pops)
    }
}

/**
 * Assign individuals to population in sequence.
 * 
 * Not random and allocates as fairly as possible accross populations.
 */
export let assign_fixed_size_population = (inds, num_pops) => {
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
export let migrate_island_fixed = (inds, migs_per_pop) => {
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
            while (ind.pop == export_pop) {
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
export let migrate_island_fixed_fixed = (inds, migs_per_pop) => {
    
}
