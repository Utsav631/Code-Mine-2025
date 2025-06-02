export const tooltipStyles = {
    backgroundColor: '#e0e0e0',
    padding: '8px 12px',
    borderRadius: '6px',
    color: '#000',
    fontSize: '12px',
    fontWeight: '500',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}

export const buttonStyles = {
  base: `
    w-12 h-12
    rounded-full
    flex items-center justify-center
    text-zinc-400
    bg-zinc-900/80
    transition-all duration-200 ease-in-out
    shadow-inner
    border border-zinc-700
  `,
  hover: `
    hover:bg-zinc-800 hover:text-white hover:shadow-md
    active:scale-95
    focus:outline-none focus:ring-2 focus:ring-primary
  `
}
