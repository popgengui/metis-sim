const chai = require('chai')
const assert = chai.assert

const all = require('../../lib/metis/all.js')
const utils = require('./test_utils.js')

describe('Population generation', () => {
    it('single individual', () => {
        let inds = all.p_generate_n_inds(1, () =>
            all.i_generate_basic_individual(utils.empty_species))
        assert.equal(inds.length, 1)
    })
})


describe('Population structure', () => {
    it('fixed size', () => {
        let inds = utils.generate_n_basic_individuals(2)
        all.p_assign_fixed_size_population(inds, 2)
        assert.equal(inds.length, 2)
        assert.equal(inds[0].pop, 0)
        assert.equal(inds[1].pop, 1)
    })
    it('random size per deme', () => {
        let real_random = Math.random
        Math.random = () => 0.9
        let inds = utils.generate_n_basic_individuals(2)
        all.p_assign_random_population(inds, 2)
        assert.equal(inds.length, 2)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 1)
        Math.random = real_random
    })
})


describe('Migration', () => {
    it('fixed individuals', () => {
        let inds = utils.generate_n_basic_individuals(2)
        all.p_assign_fixed_size_population(inds, 2)
        all.p_migrate_island_fixed(inds, 1)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 0)
    })
})
