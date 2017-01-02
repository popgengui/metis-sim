/** Simulator module
 *
 * @module simulator
 */


export let cycle = (individuals, ops) => {
    //An operation can change the ops that will execute in
    //the next cycle (but only in the next)
    //Operations should not do inconsistent changes between them...
    let in_state = {individuals, ops}
    for (let op of ops) {
        in_state = op.change(in_state.individuals, in_state.ops)
    }
    return in_state
}
