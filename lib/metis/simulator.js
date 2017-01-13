/** Simulator module
 *
 * @module simulator
 */


export let cycle = (individuals, operators, cycle=0) => {
    //An operation can change the ops that will execute in
    //the next cycle (but only in the next)
    //Operations should not do inconsistent changes between them...
    let in_state = {individuals, operators}
    let current_cycle = cycle + 1
    for (let operator of operators) {
        in_state = operator.change(
            in_state.global_parameters, current_cycle,
            in_state.individuals, in_state.operators)
    }
    in_state.cycle = current_cycle
    return in_state
}
