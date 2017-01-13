/** Simulator module
 *
 * @module simulator
 */


export let cycle = (individuals, operators) => {
    //An operation can change the ops that will execute in
    //the next cycle (but only in the next)
    //Operations should not do inconsistent changes between them...
    let in_state = {individuals, operators}
    for (let operator of operators) {
        in_state = operator.change(in_state.individuals, in_state.operators)
    }
    return in_state
}
