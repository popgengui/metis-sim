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
