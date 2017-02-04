export function random_choice(choices) {
    let pos = Math.floor(Math.random() * choices.length)
    return choices[pos]
}