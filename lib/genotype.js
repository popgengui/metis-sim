/** Representing a genotype
 *
 * @module genotype
 */


class Marker {
    constructor () {
        if (new.target == 'Marker')
            throw new TypeError('Cannot construct Marker instances directly')
    }

    get size() {
        throw new TypeError('This needs to be specified')
    }
}


class SimpleMarker extends Marker{
    get size() {return 1}
}


class SNP extends SimpleMarker {

}

class MicroSatellite extends SimpleMarker {

}

class LinkedChromosome extends Marker {
    constructor (markers, distances) {  // distances in cMs
        this.size = 0
        for (let marker of this.markers) {
            this.size += marker.size
        }

    }

    get size() {return this.size}
}


const Autosome = Sup => class extends Sup {
    get size() {return 2*super.size}
}


const Mito = Sup => class extends Sup {}


const YChromosome = Sup => class extends Sup {}


const XChromosome = Sup => class extends Sup {
    get size() {return 2*super.size} // Always double for now

}



class Genotype {
    constructor (array, metadata) {
        //Autosome is a map of chromosomes
        this.array = array
        this.metadata = metadata
    }
}