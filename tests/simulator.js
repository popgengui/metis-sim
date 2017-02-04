import chai from 'chai'
var assert = chai.assert

import * as simulator from '../lib/metis/simulator.js'
import * as reproduction from '../lib/metis/operators/reproduction.js'
import * as utils from './test_utils.js'

describe('Basic simulation', () => {
    it('No Ops simulation', () => {
        const individuals = utils.generate_n_basic_individuals(10)
        const sim_res = new simulator.cycle(individuals, [])
        assert.equal(sim_res.individuals.length, individuals.length)
    })
    it('Reproduction simulation', () => {
        let size = 10
        let rep_size = 20
        const individuals = utils.generate_n_basic_individuals(size)
        let operators = [new reproduction.SexualReproduction(
            utils.empty_species, rep_size)]
        const sim_res = new simulator.cycle(individuals, operators)
        assert.equal(sim_res.individuals.length, size + rep_size)
    })
})
