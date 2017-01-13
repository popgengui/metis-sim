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
        new_individuals = []
        for (individual of individuals) {
            if (individual.cycle === cycle) {
                new_individuals.push(individuals)
            }
        }
        return {global_parameters, new_individuals, operators}
    }
}
