import { cn } from '../../lib/utils'

/**
 * Reusable Badge component following design system
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'default'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} children - Badge content
 * @param {string} className - Additional classes
 */
export default function Badge({
    variant = 'default',
    size = 'md',
    children,
    className,
    ...props
}) {
    const variants = {
        default: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium rounded-full border',
                'transition-colors duration-200',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}
