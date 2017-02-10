/** Individual culling
 *
 * @module operators/culling
 */


 import {BaseOperator} from '../operator'

/** Remove Older Generations.
  *
 * This will work e.g. for the standrd Wright-Fisher model.
 */
export class KillOlderGenerations extends BaseOperator {
    change (state) {
        let individuals = state.individuals
        state.individuals = []
        for (let individual of individuals) {
            if (individual.cycle_born === state.cycle) {
                state.individuals.push(individual)
            }
        }
    }
}
