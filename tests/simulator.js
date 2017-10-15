const chai = require('chai')
const assert = chai.assert

const all = require('../../lib/metis/all.js')
const utils = require('./test_utils.js')

describe('Basic simulation', () => {
    it('No Ops simulation', () => {
        let individuals = utils.generate_n_basic_individuals(10)
        let orig_individuals = individuals.slice() 
        let state = {
            individuals, operators: [],
            cycle: 0,
            global_parameters: {}
        }
        all.sim_cycle(state)
        assert.equal(state.cycle, 1)
        assert.equal(state.individuals.length, orig_individuals.length)
    })
    it('Reproduction simulation', () => {
        let size = 10
        let rep_size = 20
        let individuals = utils.generate_n_basic_individuals(size)
        let operators = [new all.ops_rep_NoGenomeSexualReproduction(
            utils.empty_species, rep_size)]
        let state = {
            individuals, operators,
            cycle: 0,
            global_parameters: {}
        }
        all.sim_cycle(state)
        assert.equal(state.individuals.length, size + rep_size)
    })
})


describe('Several Cycles', () => {
    it('do_n_cycles - no ops', () => {
        let individuals = utils.generate_n_basic_individuals(10)
        let orig_individuals = individuals.slice() 
        let state = all.sim_do_n_cycles(2, individuals, [])
        assert.equal(state.cycle, 3)
        assert.equal(state.individuals.length, orig_individuals.length)
    })
})


describe('Async', () => {
    it('do_n_cycles - async', (done) => {
        let individuals = utils.generate_n_basic_individuals(10)
        let orig_individuals = individuals.slice() 
        let reporter = (state, callback) => {
            if (callback) {
                callback()
            }
            else {
                assert.equal(state.cycle, 3)
                assert.equal(state.individuals.length, orig_individuals.length)
                done()
            }
        }
        let state = all.sim_do_n_cycles(2, individuals, [], 0, reporter)
    })
})
