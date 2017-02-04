import * as genotype from '../lib/metis/genotype.js'
import * as species from '../lib/metis/species.js'
import * as individual from '../lib/metis/individual.js'
import * as integrated from '../lib/metis/integrated.js'
import * as population from '../lib/metis/population.js'

//Markers
export let SNP = new genotype.SNP()
export let autosome_SNP = new genotype.Autosome(genotype.SNP)

//Genomes
export let genome_SNP = new Map()
genome_SNP.set('SNP', autosome_SNP)

//Species
export let empty_species = new species.Species('empty', undefined)
export let single_SNP_species = new species.Species('Single SNP', genome_SNP)


//Population support
export let generate_n_basic_individuals = (n, cycle=0) => {
    return population.generate_n_inds(n,
        () => integrated.generate_basic_individual(empty_species, cycle))
}
