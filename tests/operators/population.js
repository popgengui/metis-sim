import chai from 'chai'
var assert = chai.assert

import * as population from '../../lib/metis/population'
import * as pop_ops from '../../lib/metis/operators/population'
import * as utils from '../test_utils.js'

describe('Island model migration operators', () => {
    it('fixed size population wrapper', () => {
        let mig_op = new pop_ops.MigrationIslandFixedOperator(1)
        let inds = utils.generate_n_basic_individuals(2)
        population.assign_fixed_size_population(inds, 2)
        population.migrate_island_fixed(inds, 1)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 0)

    })
})
