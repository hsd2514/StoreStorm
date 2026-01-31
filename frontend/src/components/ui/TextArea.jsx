import { cn } from '../../lib/utils'
import { forwardRef, useId } from 'react'

/**
 * Reusable TextArea component following design system
 */
const TextArea = forwardRef(({
    label,
    error,
    helperText,
    className,
    wrapperClassName,
    id,
    required,
    rows = 4,
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
                <textarea
                    ref={ref}
                    id={inputId}
                    rows={rows}
                    required={required}
                    className={cn(
                        'w-full px-4 py-3',
                        'bg-black/40',
                        'border border-white/10',
                        'hover:border-white/20',
                        'focus:border-purple-500 focus:ring-1 focus:ring-purple-500',
                        'rounded-xl',
                        'text-white',
                        'placeholder-zinc-500',
                        'transition-colors duration-200',
                        'outline-none resize-none',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
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

TextArea.displayName = 'TextArea'

export default TextArea
