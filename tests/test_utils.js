import * as genotype from '../lib/metis/genotype.js'
import * as species from '../lib/metis/species.js'
import * as individual from '../lib/metis/individual.js'
import * as integrated from '../lib/metis/integrated.js'
import * as population from '../lib/metis/population.js'

//Markers
export let snp1 = new genotype.SNP()
export let snp2 = new genotype.SNP()
export let autosome_SNP = new genotype.Autosome(genotype.SNP)

//Genome metadata
export let metadata_genome_SNP = new Map()
metadata_genome_SNP.set('SNP', autosome_SNP)

//Genomes
let two_SNP_genome = new genotype.ChromosomePair([snp1, snp2])

//Species
export let empty_species = new species.Species('empty', undefined)
export let two_SNP_species = new species.Species('2 SNPs', two_SNP_genome)


//Population support
export let generate_n_basic_individuals = (n, cycle=0) => {
    return population.generate_n_inds(n,
        () => individual.generate_basic_individual(empty_species, cycle))
}
