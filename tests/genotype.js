const chai = require('chai')
const assert = chai.assert

const genotype = require('../../lib/metis/all.js')

describe('Markers without linkage information', () => {
    it('Marker', () => {
        assert.throws(() => {new genotype.gn_Marker()}, 'Cannot')
    })
    it('SNP', () => {
        let snp = new genotype.gn_SNP()
        assert.equal(snp.possible_values.length, 2)
    })
})

describe('Linkage', () => {
    let snp1 = new genotype.gn_SNP()
    let snp2 = new genotype.gn_SNP()
    it('Not linked', () => {
        let unlinked = new genotype.gn_Chromosome([snp1, snp2])
        assert.equal(unlinked.markers.length, 2)
    })
    it('Linked', () => {
        assert.throws(() => {new genotype.gn_Chromosome([snp1, snp2], [])}, RangeError)
        let linked = new genotype.gn_Chromosome([snp1, snp2], [0.1])
        assert.equal(linked.markers.length, 2)
        assert.equal(linked.distances[0], 0.1)
    })

})

describe('Autosome', () => {
    let snp1 = new genotype.gn_SNP()
    let snp2 = new genotype.gn_SNP()
    class AutosomeSNP extends genotype.gn_Autosome(genotype.gn_SNP) {
    }
    class UnlinkedAutosomeChro extends genotype.gn_UnlinkedAutosome(genotype.gn_Chromosome) {
    }

    it('Single SNP', () => {
        let single_SNP = new AutosomeSNP()
        //assert.deepEqual(single_SNP.transmit([0, 0]), [0])
    })
    it('Two SNPs', () => {
        //needs more tests
        let SNPs = new genotype.gn_ChromosomePair([snp1, snp2])
        //assert.deepEqual(SNPs.transmit([0, 1, 0, 1]), [0, 1])
    })
    it('Two SNPs - Unlinked', () => {
        //needs more tests
        let SNPs = new UnlinkedAutosomeChro([snp1, snp2])
        //let transmit = SNPs.transmit([0, 1, 0, 1])
        //assert.typeOf(transmit, 'UInt8Array')
        //assert.deepEqual(transmit, Uint8Array.from([0, 1]))
    })
})


describe('Genome', () => {
    let snp11 = new genotype.gn_SNP()
    let snp12 = new genotype.gn_SNP()
    let snp21 = new genotype.gn_SNP()
    it('Two chromosomes', () => {
        let linked = new genotype.gn_ChromosomePair([snp11, snp12], [0.1])
        let single = new genotype.gn_ChromosomePair([snp21])
        let genome_meta = {linked, single}
        let genome = new genotype.gn_Genome(genome_meta)
        let marker_order = genome.marker_order
        let first_size = genome_meta[marker_order[0]].size
        assert.equal(marker_order.length, 2)
        assert.equal(genome.get_marker_start(marker_order[0]), 0)
        assert.equal(genome.get_marker_start(marker_order[1]), first_size)
    })

})
