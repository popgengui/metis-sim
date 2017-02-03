import chai from 'chai'
var assert = chai.assert

import * as genotype from '../lib/metis/genotype.js'

describe('Markers without linkage information', () => {
    it('Marker', () => {
        assert.throws(() => {new genotype.Marker()}, 'Cannot')
    })
    it('SimpleMarker', () => {
        let marker = new genotype.SimpleMarker()
        assert.equal(marker.size, 1)
        let marker2 = new genotype.SimpleMarker([0, 1])
        assert.equal(marker2.possible_values.length, 2)
    })
    it('SNP', () => {
        let snp = new genotype.SNP()
        assert.equal(snp.possible_values.length, 2)
    })
})

describe('Linkage', () => {
    let snp1 = new genotype.SNP()
    let snp2 = new genotype.SNP()
    it('Not linked', () => {
        let unlinked = new genotype.Chromosome([snp1, snp2])
        assert.equal(unlinked.markers.length, 2)
    })
    it('Linked', () => {
        assert.throws(() => {new genotype.Chromosome([snp1, snp2], [])}, RangeError)
        let linked = new genotype.Chromosome([snp1, snp2], [0.1])
        assert.equal(linked.markers.length, 2)
        assert.equal(linked.distances[0], 0.1)
    })

})

describe('Autosome', () => {
    let snp1 = new genotype.SNP()
    let snp2 = new genotype.SNP()
    class AutosomeSNP extends genotype.Autosome(genotype.SNP) {
    }
    class AutosomeChro extends genotype.Autosome(genotype.Chromosome) {
    }
    class UnlinkedAutosomeChro extends genotype.UnlinkedAutosome(genotype.Chromosome) {
    }

    it('Single SNP', () => {
        let single_SNP = new AutosomeSNP()
        assert.deepEqual(single_SNP.transmit([0, 0]), [0])
    })
    it('Two SNPs', () => {
        //needs more tests
        let SNPs = new AutosomeChro([snp1, snp2])
        assert.deepEqual(SNPs.transmit([0, 1, 0, 1]), [0, 1])
    })
    it('Two SNPs - Unlinked', () => {
        //needs more tests
        let SNPs = new UnlinkedAutosomeChro([snp1, snp2])
        let transmit = SNPs.transmit([0, 1, 0, 1])
        assert.typeOf(transmit, 'UInt8Array')
        console.log(transmit)
        assert.deepEqual(transmit, Uint8Array.from([0, 1]))
    })
})