export function getFlowerEmoji(id: string): string {
  const map: Record<string, number[]> = {
    rose: [0x1F339],
    sunflower: [0x1F33B],
    carnation: [0x1F338],
    tulip: [0x1F337],
    cherry: [0x1F352],
    star: [0x2B50],
    heart: [0x2764, 0xFE0F],
    graduation: [0x1F393],
  };
  const codePoints = map[id];
  if (!codePoints) return '';
  return String.fromCodePoint(...codePoints);
}

export function getAllFlowerEmojis(): string[] {
  return [
    getFlowerEmoji('rose'),
    getFlowerEmoji('sunflower'),
    getFlowerEmoji('carnation'),
    getFlowerEmoji('tulip'),
    getFlowerEmoji('cherry'),
    getFlowerEmoji('star'),
    getFlowerEmoji('heart'),
    String.fromCodePoint(0x2728),
  ].filter(Boolean);
}

export function getGraduationEmoji(): string {
  return String.fromCodePoint(0x1F393);
}
