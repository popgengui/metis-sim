/** Operators
 *
 * @module ops
 */

export class BaseOperator {
    change(global_parameters, cycle, individuals, operators) {
        throw TypeError('This is an abstract method')
    }
}


export class StatisticsOperator extends BaseOperator {
    constructor() {
        super()
    }

    change(global_parameters, cycle, individuals, operators) {
        this.compute(global_parameters, cycle, individuals)
        return {global_parameters, individuals, operators}
    }
}


//Genome statistics should choose markers



export class GenomeCountStatistics extends StatisticsOperator {
    compute(global_parameters, cycle, individuals) {
        let species = individuals[0].species
        let genome = species.genome
        let metadata = genome.metadata
        let position = 0
        let counts = {}
        for (let marker_name of genome.marker_order) {
            let marker_counts = []
            let marker = metadata[marker_name]
            let features = marker.markers
            let num_features, start
            if (marker.is_autosomal) {
                num_features = features.length / 2
                start = [0, num_features]
            }
            else {
                num_features = features.length
                start = [0]
            }
            for (let i=0; i < num_features; i++) {
                let feature_counts = {}
                for (let my_start of start) {
                    for (let individual of individuals) {
                        let allele = individual.genome[position + i]
                        if (allele in feature_counts) {
                            feature_counts[allele] += 1
                        }
                        else {
                            feature_counts[allele] = 1
                        }
                    }
                }
                marker_counts.push(feature_counts)
            }
            position += marker.size
            counts[marker_name] = marker_counts
        }
        this.compute_counts(counts)
    }
}
