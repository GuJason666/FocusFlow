export const CATEGORIES = ['Academic', 'Wellness', 'Social', 'Career', 'Other'] as const;
export type Category = typeof CATEGORIES[number];
