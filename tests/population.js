import chai from 'chai'
var assert = chai.assert

import * as population from '../lib/metis/population.js'
import * as individual from '../lib/metis/individual.js'
import * as integrated from '../lib/metis/integrated.js'
import * as utils from './test_utils.js'

describe('Population generation', () => {
    it('single individual', () => {
        let inds = population.generate_n_inds(1, () =>
            individual.generate_basic_individual(utils.empty_species))
        assert.equal(inds.length, 1)
    })
})


describe('Population structure', () => {
    it('fixed size', () => {
        let inds = population.generate_n_inds(2, () =>
            individual.generate_basic_individual(utils.empty_species))
        population.assign_fixed_size_population(inds, 2)
        assert.equal(inds.length, 2)
        assert.equal(inds[0].pop, 0)
        assert.equal(inds[1].pop, 1)
    })
    it('random size per deme', () => {
        let real_random = Math.random
        Math.random = () => 0.9
        let inds = population.generate_n_inds(2, () =>
            individual.generate_basic_individual(utils.empty_species))
        population.assign_random_population(inds, 2)
        assert.equal(inds.length, 2)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 1)
        Math.random = real_random
    })
})


describe('Migration', () => {
    it('fixed individuals', () => {
        let inds = population.generate_n_inds(2, () =>
            individual.generate_basic_individual(utils.empty_species))
        population.assign_fixed_size_population(inds, 2)
        population.migrate_island_fixed(inds, 1)
        assert.equal(inds[0].pop, 1)
        assert.equal(inds[1].pop, 0)
    })
})
