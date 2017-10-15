const chai = require('chai')
const assert = chai.assert

const individual = require('../../lib/metis/all.js')
const test_utils = require('./test_utils.js')

describe('Individual object', () => {
    it('Basic creation', () => {
        let ind = new individual.i_Individual()
        assert.isDefined(ind.id)
        assert.equal(ind.alive, true)
    })
    it('assign_random_sex', () => {
        let ind = individual.i_generate_basic_individual()
        individual.i_assign_random_sex(ind)
        assert.isDefined(ind.is_female)
    })
    it('generate_basic_individual', () => {
        let ind = individual.i_generate_basic_individual(test_utils.empty_species, 5)
        assert.equal(ind.cycle_born, 5)
        assert.isDefined(ind.id)
    })

})
