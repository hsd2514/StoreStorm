import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Loading spinner component
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - Additional classes
 */
export default function LoadingSpinner({
    size = 'md',
    className
}) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    return (
        <div className="flex justify-center items-center py-20">
            <Loader2
                className={cn(
                    'text-purple-500 animate-spin',
                    sizes[size],
                    className
                )}
                aria-hidden="true"
            />
            <span className="sr-only">Loading…</span>
        </div>
    )
}

/**
 * Inline loading spinner for buttons
 */
export function InlineSpinner({ className }) {
    return (
        <Loader2
            className={cn('w-4 h-4 animate-spin', className)}
            aria-hidden="true"
        />
    )
}

/**
 * Loading skeleton for content placeholders
 */
export function Skeleton({ className }) {
    return (
        <div
            className={cn(
                'bg-white/5 rounded-lg shimmer',
                className
            )}
            aria-hidden="true"
        />
    )
}
