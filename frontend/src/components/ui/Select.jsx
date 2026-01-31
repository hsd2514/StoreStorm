import { cn } from '../../lib/utils'
import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Reusable Select component following design system
 */
const Select = forwardRef(({
    label,
    error,
    helperText,
    className,
    wrapperClassName,
    id,
    required,
    children,
    ...props
}, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
        <div className={cn('w-full', wrapperClassName)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-zinc-400 mb-1"
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    ref={ref}
                    id={inputId}
                    required={required}
                    className={cn(
                        'w-full px-4 py-3 appearance-none',
                        'bg-black/40',
                        'border border-white/10',
                        'hover:border-white/20',
                        'focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
                        'rounded-xl',
                        'text-white',
                        'transition-colors duration-200',
                        'outline-none',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-400" role="alert">
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-zinc-500">
                    {helperText}
                </p>
            )}
        </div>
    )
})

Select.displayName = 'Select'

export default Select
