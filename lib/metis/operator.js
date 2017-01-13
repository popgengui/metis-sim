/** Operators
 *
 * @module ops
 */

export class BaseOperator {
    change(global_parameters, cycle, individuals, operators) {
        throw TypeError('This is an abstract method')
    }
}
