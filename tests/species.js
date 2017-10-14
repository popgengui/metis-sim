const chai = require('chai')
const assert = chai.assert

const species = require('../../lib/metis/all.js')

describe('Species object', () => {
    it('Basic creation', () => {
        let sp = new species.sp_Species('test', undefined)
        assert.equal(sp.name, 'test')
    })
})
