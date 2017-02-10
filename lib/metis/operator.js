/** Operators
 *
 * @module ops
 */

import {EventEmitter} from 'events'


export class BaseOperator {
    /**
     * Operates over global state
     * has: global_parameters, cycle, individuals, operators
     */
    change(state) {
        throw TypeError('This is an abstract method')
    }
}


export class RxOperator extends BaseOperator {
    constructor() {
        super()
        this._emitter = EventEmitter.create()
        this._emitter.on('event', () => {
            console.log('event')
            this._global_parameters['test'] = 1
            return this._global_parameters
        })
        this._observable = Rx.Observable.fromEvent(this._emitter)
    }

    change(state) {
        this._global_parameters = state.global_parameters
        this._emitter.emit('event')
    }

    get observable() {
        return this._observable
    }
    
}


//Genome statistics should choose markers


export class StatisticsOperator extends BaseOperator {
    constructor(name) {
        super()
        this._name = name
    }

    change(state) {
        state.global_parameters[this._name] = this.compute(
            state.global_parameters, state.cycle, state.individuals)
    }
}


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
        return this.compute_counts(counts)
    }
}
