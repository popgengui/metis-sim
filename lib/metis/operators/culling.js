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
    change (global_parameters, cycle, individuals, operators) {
        const new_individuals = []
        for (let individual of individuals) {
            if (individual.cycle_born === cycle) {
                new_individuals.push(individual)
            }
        }
        return {global_parameters, individuals: new_individuals, operators}
    }
}
