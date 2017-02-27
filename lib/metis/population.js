/** Population module
 *
 * This is a bit more general than "population" genetics. It can
 * generate many models of demography (e.g. landscape)
 *
 * @module population
 */


export let generate_n_inds = (num_inds, generator) => {
    let inds = []
    for (let i=0; i<num_inds; i++) {
        inds.push(generator())
    }
    return inds
}


export let assign_random_population = (inds, num_pops) => {
    for (let ind of inds) {
        ind.pop = Math.floor(Math.random() * num_pops)
    }
}


export let assign_fixed_size_population = (inds, num_pops) => {
    for (let i=0; i<inds.length; i++) {
        inds[i].pop = i % num_pops
    }
}