/** Heterozygosity based statistics 
 *
 * @module operators/stats/hz
 */

import {GenomeCountStatistics} from '../../operator'
import {Autosome} from '../../genotype'

export class ExpHe extends GenomeCountStatistics {
    constructor(name='ExpHe') {
        super(name)
    }

    compute_counts(counts) {
        let exp_he = {}
        for (let marker in counts) {
            let exp_hes = []
            for (let ft_counts of counts[marker]) {
                let dif_cnt = 1.0
                let all_counts = 0
                for (let allele in ft_counts) {
                    all_counts += ft_counts[allele]
                }
                for (let allele in ft_counts) {
                    let f = ft_counts[allele] / all_counts
                    dif_cnt -= f*f
                }
                exp_hes.push(dif_cnt)
            }
            exp_he[marker] = exp_hes
        }
        return exp_he
    }
}