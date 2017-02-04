import chai from 'chai'
var assert = chai.assert

import * as integrated from '../lib/metis/integrated.js'
import * as test_utils from './test_utils.js'

describe('Individual object', () => {
    it('generate_basic_individual', () => {
        let ind = new integrated.generate_basic_individual(test_utils.empty_species, 5)
        assert.equal(ind.cycle_born, 5)
        assert.isDefined(ind.id)
    })
})
