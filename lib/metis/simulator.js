/** Simulator module
 *
 * @module simulator
 */

import {CycleStopOperator} from './operator'

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
export let do_n_cycles = (n, individuals, operators, previous_cycle=0,
    callback) => {
    let add_operators = operators.slice()
    add_operators.push(new CycleStopOperator(n + previous_cycle))
        if (callback) {
        do_async_cycles(individuals, add_operators, previous_cycle, {}, callback)
    }
    else {
        return do_unspecified_cycles(individuals, add_operators, previous_cycle)
    }
}


/**
 * Do unspecified cycles of simulation.
 * 
 * One operator will add a stop=true to global_parameters
 *
 * @param {integer} number of cycles
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 */
export let do_unspecified_cycles = (individuals, operators, previous_cycle=0) => {
    let state = {
        global_parameters: {stop: false}, individuals,
        operators, cycle: previous_cycle
    }
    while (state.global_parameters.stop === false) {
        cycle(state)
    }
    return state
}


/**
 * Do async (unspecified) cycles of simulation.
 *
 * One operator will add a stop=true to global_parameters
 *
 * @param {integer} number of cycles
 * @param {individuals[]} individuals List of individuals
 * @param {BaseOperator[]} operators List of operators
 * @param {integer} operator
 * @param callback
 */
export let do_async_cycles = (individuals, operators,
    previous_cycle=0, global_parameters={}, callback) => {
    let state = {
        global_parameters: {stop: false}, individuals,
        operators, cycle: previous_cycle
    }
    cycle(state)
    let return_callback
    if (!state.global_parameters.stop) {
        return_callback = do_async_cycles.bind(null, individuals, operators,
            previous_cycle + 1, state.global_parameters, callback) 
    }
    callback(state, return_callback)
}