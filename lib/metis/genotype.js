/** @module genotype */

/** A Genomic marker.
 *
 * This is an abstract class.
 */
export class Marker {
    constructor () {
        if (new.target === 'Marker')
            throw new TypeError('Cannot construct Marker instances directly')
    }

    /** The size of the marker for the Array */
    get size() {
        throw new TypeError('This needs to be specified')
    }


    /** Possible values for the marker */
    get possible_values() {
        return this._possible_values
    }

    set possible_values(possible_values) {
        this._possible_values = possible_values
    }

}


/**
 * A marker of size 1.
 * @extends Marker
 */
export class SimpleMarker extends Marker {
    get size() {return 1}
}


/**
 * A Single-Nucleotide Polymorphism (SNP).
 * @extends SimpleMarker
 */
export class SNP extends SimpleMarker {
    /** Default for SNP is bi-allelic */
    constructor(possible_values=[0, 1]) {
        super()
        this.possible_values = possible_values
    }
}


/**
 * A Microsatelite.
 * @extends SimpleMarker
 */
export class MicroSatellite extends SimpleMarker {
    constructor(possible_values) {
        super()
        this.possible_values = possible_values
    }

}


/**
 * An unlinked chromosome.
 * @extends Marker
 */
export class UnlinkedChromosome extends Marker {
    constructor (markers) {  // distances in cMs
        super()
        this.size = 0
        for (let marker of this.markers) {
            this.size += marker.size
        }
    }

    get size() {
        return this.size
    }
}


/**
 * A Complete linked chromosome.
 * @extends Marker
 */
export class LinkedChromosome extends Marker {
    constructor (markers, distances) {  // distances in cMs
        super()
        this.size = 0
        for (let marker of this.markers) {
            this.size += marker.size
        }
        this.distances = distances
    }

    get size() {
        return this.size
        //XXX Size is wrong (what about distances?)
    }
}


export const Autosome = Sup => class extends Sup {
    get size() {return 2*super.size}
}


export const Mito = Sup => class extends Sup {}


export const YChromosome = Sup => class extends Sup {}


export const XChromosome = Sup => class extends Sup {
    get size() {return 2*super.size} // Always double for now

}


export class Genome {
    constructor (metadata) {
        //metadata is a map of {string} to {@link Marker}
        this.metadata = metadata
        this._compute_marker_positions()
        let last_marker_name = this._marker_order[this._marker_order.length -1]
        let last_marker_size = this.metadata[last_marker_name].size
        this._size = this.marker_start(last_marker_name) + last_marker_size
    }

    _compute_marker_positions() {
        this._marker_order = []
        this._marker_start = Set()
        let start = 0
        for (let [name, marker] of this.metadata) {
            this._marker_order.push(name)
            this._marker_start.set(name, start)
            start += marker.size
        }

    }

    get_marker_start(name) {
        return this._marker_start.get(name)
    }

    get size() {
        return this.size
    }
}
