
export function rollDice(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
}

export function getXpRequiredForLevel(level: number): number {
    return Math.floor(((Math.pow(level, 2) - level) * 2500) / 2);
}

export function rollD20(): string {
    const num = rollDice(20);
    switch (num) {
        case 1:
            return `Oh no. You rolled a natural ${num} (critical failure).`;
        case 20:
            return `Nice! You rolled a natural ${num} (critical success).`;
        default:
            return `You rolled a ${num}!`;
    }
}