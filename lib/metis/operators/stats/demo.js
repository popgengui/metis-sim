/** Demography 
 *
 * @module operators/stats/demo
 */

import {StatisticsOperator} from '../../operator'

export class SexStatistics extends StatisticsOperator {
    compute(global_parameters, cycle, individuals) {
        let males = 0
        let females = 0
        for (let individual of individuals) {
            if (individual.is_female) {
                females += 1
            }
            else {
                males +=1
            }
        }
        console.log('f', females, 'm', males, females + males)
    }
}