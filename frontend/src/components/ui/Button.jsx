import { cn } from '../../lib/utils'

/**
 * Reusable Button component following design system
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Show loading state
 * @param {boolean} disabled - Disable button
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional classes
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className,
    type = 'button',
    ...props
}) {
    const variants = {
        primary: `
      bg-gradient-to-r from-purple-600 to-purple-500
      hover:from-purple-500 hover:to-purple-400
      text-white font-medium
      shadow-lg shadow-purple-500/25
      hover:shadow-xl hover:shadow-purple-500/30
      hover:-translate-y-0.5
      focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black
    `,
        secondary: `
      bg-white/5
      hover:bg-white/10
      border border-white/10
      text-zinc-400
      hover:text-white
      focus-visible:ring-2 focus-visible:ring-purple-500
    `,
        danger: `
      bg-gradient-to-r from-red-600 to-red-500
      hover:from-red-500 hover:to-red-400
      text-white font-medium
      shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/30
      hover:-translate-y-0.5
      focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black
    `,
        ghost: `
      text-zinc-400
      hover:text-white
      hover:bg-white/5
      focus-visible:ring-2 focus-visible:ring-purple-500
    `,
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    }

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={cn(
                'inline-flex items-center justify-center gap-2',
                'rounded-xl',
                'transition-all duration-200',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                'outline-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    )
}
