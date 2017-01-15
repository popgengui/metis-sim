import chai from 'chai'
var assert = chai.assert

import * as species from '../lib/metis/species.js'

describe('Species object', () => {
    it('Basic creation', () => {
        let sp = new species.Species('test', undefined)
        assert.equal(sp.name, 'test')
    })
})
