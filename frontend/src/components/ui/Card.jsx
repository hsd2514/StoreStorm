import { cn } from '../../lib/utils'

/**
 * Reusable Card component following design system
 * @param {string} variant - 'glass' | 'elevated' | 'gradient'
 * @param {boolean} hover - Enable hover effect
 * @param {React.ReactNode} children - Card content
 * @param {string} className - Additional classes
 */
export default function Card({
    variant = 'glass',
    hover = false,
    children,
    className,
    ...props
}) {
    const variants = {
        glass: `
      bg-white/5
      backdrop-blur-xl
      border border-white/10
    `,
        elevated: `
      bg-[#1a1a24]
      border border-white/5
      shadow-xl shadow-black/20
    `,
        gradient: `
      relative
      overflow-hidden
      bg-gradient-to-br from-purple-500/10 to-transparent
      border border-purple-500/20
    `,
    }

    return (
        <div
            className={cn(
                'rounded-2xl p-6',
                'transition-all duration-200',
                hover && 'hover:bg-white/[0.03] cursor-pointer',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * Stat Card variant for dashboard metrics
 */
export function StatCard({
    icon: Icon,
    iconColor = 'text-purple-400',
    iconBg = 'bg-purple-500/10',
    value,
    label,
    trend,
    trendUp = true,
    className,
    ...props
}) {
    return (
        <Card variant="glass" className={cn('', className)} {...props}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-xl',
                    iconBg
                )}>
                    {Icon && <Icon className={cn('w-6 h-6', iconColor)} aria-hidden="true" />}
                </div>
                <div className="flex-1">
                    <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                    <p className="text-sm text-zinc-400">{label}</p>
                </div>
                {trend && (
                    <div className={cn(
                        'text-sm font-medium',
                        trendUp ? 'text-green-400' : 'text-red-400'
                    )}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </div>
                )}
            </div>
        </Card>
    )
}
