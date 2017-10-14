const chai = require('chai')
const assert = chai.assert

const all = require('../../../lib/metis/all.js')
const utils = require('../test_utils.js')

describe('Island model migration operators', () => {
    it('fixed size population wrapper', () => {
        let mig_op = new all.ops_p.MigrationIslandFixedOperator(1)
        let inds = utils.generate_n_basic_individuals(2)
        population.assign_fixed_size_population(inds, 2)
        population.migrate_island_fixed(inds, 1)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 0)

    })
})
