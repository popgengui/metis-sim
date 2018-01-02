const all = require('../../lib/metis-sim/all.js')

//Markers
let snp1 = new all.gn_SNP()
let snp2 = new all.gn_SNP()
let autosome_SNP = all.gn_Autosome(all.gn_SNP)

//Genome metadata
let metadata_genome_SNP = new Map()
metadata_genome_SNP.set('SNP', autosome_SNP)



//Genomes
let two_SNP_chro_pair = new all.gn_ChromosomePair([snp1, snp2])
let metadata_genome_two_SNP = {SNP2: two_SNP_chro_pair}
let two_SNP_genome = new all.gn_Genome(metadata_genome_two_SNP)

//Species
let empty_species = new all.sp_Species('empty', undefined)
let two_SNP_species = new all.sp_Species('2 SNPs', two_SNP_genome)


//Population support
let generate_n_basic_individuals = (n, cycle=0) => {
    return all.p_generate_n_inds(n,
        () => all.i_generate_basic_individual(empty_species, cycle))
}

module.exports.generate_n_basic_individuals = generate_n_basic_individuals
module.exports.two_SNP_species = two_SNP_species
