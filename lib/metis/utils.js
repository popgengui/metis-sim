export function random_choice(choices) {
    let pos = Math.floor(random() * choices.length)
    return choices[pos]
}