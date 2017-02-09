/** Heterozygosity based statistics 
 *
 * @module operators/stats/hz
 */

import {GenomeCountStatistics} from '../../operator'
import {Autosome} from '../../genotype'

export class ExpHe extends GenomeCountStatistics {
    compute_counts(counts) {
        console.log(counts)
    }
}