/** Population
 *
 * @module operators/reproduction
 */

import {BaseOperator} from '../operator'
import {migrate_island_fixed} from '../population'

export class MigrationIslandFixedOperator extends BaseOperator {
    /**
     * Creates an instance of MigrationIslandFixedOperator.
     * 
     * Wraps {@link migrate_island_fixed}
     * 
     * @param {any} migs_per_pop migrants per population
     * 
     * @memberOf MigrationIslandFixedOperator
     */
    constructor (migs_per_pop) {
        super()
        this._migs_per_pop = migs_per_pop
    }

    change(state) {
        migrate_island_fixed(state.individuals, this._migs_per_pop)
    }
}