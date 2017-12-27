const chai = require('chai')
const assert = chai.assert

const all = require('../../../lib/metis/all.js')
const utils = require('../test_utils.js')

describe('Island model migration operators', () => {
    it('fixed size population wrapper', () => {
        //let mig_op = new all.ops_p_MigrationIslandFixedOperator(1)
        let inds = utils.generate_n_basic_individuals(2)
        all.p_assign_fixed_size_population(inds, 2)
        all.p_migrate_island_fixed(inds, 1)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 0)

    })
})
