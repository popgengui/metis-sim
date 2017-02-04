import chai from 'chai'
var assert = chai.assert

import * as culling from '../../lib/metis/operators/culling.js'
import {generate_basic_individual} from '../../lib/metis/integrated.js'
import * as utils from '../test_utils.js'

describe('Culling', () => {
    let kill_older = new culling.KillOlderGenerations()
    let individuals = utils.generate_n_basic_individuals(10, 0)
    it('Remove all individuals', () => {
        let survival = kill_older.change({}, 1, individuals, [])
        assert.equal(survival.individuals.length, 0)
    })
    it('Save all individuals', () => {
        let survival = kill_older.change({}, 0, individuals, [])
        assert.equal(survival.individuals.length, 10)
    })
    it('Save one individual', () => {
        let add_individuals = individuals.slice()
        add_individuals.push(generate_basic_individual(utils.empty_species, 1))
        let survival = kill_older.change({}, 1, add_individuals, [])
        assert.equal(survival.individuals.length, 1)
    })
})
