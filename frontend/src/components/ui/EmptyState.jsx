import { cn } from '../../lib/utils'

/**
 * Empty state component for no data scenarios
 * @param {React.ReactNode} icon - Icon component from lucide-react
 * @param {string} title - Main message
 * @param {string} description - Supporting text
 * @param {React.ReactNode} action - CTA button or element
 * @param {string} className - Additional classes
 */
export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-20 text-center',
            className
        )}>
            {Icon && (
                <div className="mb-4">
                    <Icon
                        className="w-12 h-12 text-zinc-600"
                        aria-hidden="true"
                    />
                </div>
            )}
            {title && (
                <h3 className="text-lg font-semibold text-zinc-400 mb-2">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-sm text-zinc-500 mb-6 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    )
}
