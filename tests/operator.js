import chai from 'chai'
var assert = chai.assert

import * as operator from '../lib/metis/operator'

describe('CycleStopOperator', () => {
    let op = new operator.CycleStopOperator(2)
    let state = {global_parameters: {}}
    it('Should not stop now', () => {
        state.cycle = 1
        state.global_parameters.stop = false
        op.change(state)
        assert.equal(state.global_parameters.stop, false)
    })
    it('If stopped, should not be put to run', () => {
        state.cycle = 1
        state.global_parameters.stop = true
        op.change(state)
        assert.equal(state.global_parameters.stop, true)
    })
    it('Should stop now', () => {
        state.cycle = 2
        state.global_parameters.stop = false
        op.change(state)
        assert.equal(state.global_parameters.stop, true)
    })

})

describe('RxOperator', () => {
    it('Async test', (done) => {
        let op = new operator.RxOperator()
        op.subscribe((state) => {
            assert.equal(state.ok, true)
            done()
        })
        op.change({global_parameters: {ok: true}})
    })
})