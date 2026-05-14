import OpenCC from 'opencc-js';

const toSimplified = OpenCC.Converter({ from: 'tw', to: 'cn' });
const toTraditional = OpenCC.Converter({ from: 'cn', to: 'tw' });

export const chineseSearchVariants = (term: string): string[] => {
  const normalized = term.normalize('NFKC').trim();

  if (!normalized) {
    return [];
  }

  return Array.from(new Set([normalized, toSimplified(normalized), toTraditional(normalized)].filter(Boolean)));
};
