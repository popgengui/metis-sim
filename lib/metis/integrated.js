import {Individual} from './individual'
import {random_choice} from './utils'


/** Create an individual for a species in a cycle */
export let generate_basic_individual = (species, cycle,
    genome_generator=(individual)=>{}) => {
    let ind = new Individual(species, cycle)
    genome_generator(ind)
    return ind
}

export function create_randomized_genome(individual) {
    let species = individual.species
    let genome = species.genome
    let metadata = genome.metadata
    let position = 0
    let genome_buffer = ArrayBuffer(genome.size)
    let genome_data = Uint8Array(genome_buffer)
    for (let marker_name of genome.marker_order) {
        let marker = metadata[marker_name]
        let possible_values = marker.possible_values
        for (let i=0; i<marker.size; i++) {
            genome_data[position + i] = random_choice(possible_values)

        }
        position += marker.size
    }
    individual.genome = genome_data

}