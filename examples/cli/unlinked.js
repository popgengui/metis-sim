//Unlinked makers
import {Species} from '../../lib/metis/species'
import {assign_random_sex} from '../../lib/metis/individual'
import {generate_n_inds} from '../../lib/metis/population'
import {generate_individual_with_genome, create_randomized_genome} from '../../lib/metis/integrated'
import * as genotype from '../../lib/metis/genotype'

import * as reproduction from '../../lib/metis/operators/reproduction'

import {cycle} from '../../lib/metis/simulator'

const genome_size = 5
const size = 20
let unlinked_genome = genotype.generate_unlinked_genome(genome_size,
    () => {return new genotype.SNP()})
console.log(unlinked_genome)
const species = new Species('unlinked', unlinked_genome)

let individuals = generate_n_inds(size, () =>
    assign_random_sex(generate_individual_with_genome(species, 0, create_randomized_genome)))

let operators = [new reproduction.SexualReproduction(species, size)]

//console.log(individuals)

let state = cycle(individuals, operators)

console.log(state.individuals)
