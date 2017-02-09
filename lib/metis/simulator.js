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
export let cycle = (individuals, operators, previous_cycle=0) => {
    //An operation can change the ops that will execute in
    //the next cycle (but only in the next)
    //Operations should not do inconsistent changes between them...
    let in_state = {individuals, operators}
    let current_cycle = previous_cycle + 1
    for (let operator of operators) {
        in_state = operator.change(
            in_state.global_parameters, current_cycle,
            in_state.individuals, in_state.operators)
    }
    in_state.cycle = current_cycle
    return in_state
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
        state = cycle(state.individuals, state.operators, state.cycle)

    }
}