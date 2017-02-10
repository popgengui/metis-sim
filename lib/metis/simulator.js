/** Simulator module
 *
 * @module simulator
 */


/** Executes the simulator for a single cycle.
 *
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 */
export let cycle = (state) => {
    //An operation can change the ops that will execute in
    //the next cycle (but only in the next)
    //Operations should not do inconsistent changes between them...
    for (let operator of state.operators) {
        operator.change(state)
    }
    state.cycle += 1
}


/**
 * Do n cycles of simulation
 *
 * @param {integer} number of cycles
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 */
export let do_n_cycles = (n, individuals, operators, previous_cycle=0) => {
    let state = {
        global_parameters: {}, individuals,
        operators, cycle: previous_cycle
    }
    for(let i=0; i<n; i++) {
        cycle(state)
    }
    return state
}