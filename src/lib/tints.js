// The coloured parts of the interface, taken from the shadcn chart tokens so
// they follow the light and dark themes. Class names are written out in full:
// Tailwind only generates the ones it can read here.
export const TINTS = [
    { card: "bg-chart-1/10 border-chart-1/25 hover:border-chart-1/60", chip: "bg-chart-1/15 text-chart-1", solid: "bg-chart-1" },
    { card: "bg-chart-2/10 border-chart-2/25 hover:border-chart-2/60", chip: "bg-chart-2/15 text-chart-2", solid: "bg-chart-2" },
    { card: "bg-chart-3/10 border-chart-3/25 hover:border-chart-3/60", chip: "bg-chart-3/15 text-chart-3", solid: "bg-chart-3" },
    { card: "bg-chart-4/10 border-chart-4/25 hover:border-chart-4/60", chip: "bg-chart-4/15 text-chart-4", solid: "bg-chart-4" },
    { card: "bg-chart-5/10 border-chart-5/25 hover:border-chart-5/60", chip: "bg-chart-5/15 text-chart-5", solid: "bg-chart-5" },
];

// The same thing always gets the same colour.
export const tintFor = (id) => TINTS[Math.abs(Number(id) || 0) % TINTS.length];
