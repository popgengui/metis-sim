/** Operators
 *
 * @module ops
 */

export class BaseOperator {
    change(individuals, operators) {
        throw TypeError('This is an abstract method')
    }
}
