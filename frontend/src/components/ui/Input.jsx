import { cn } from '../../lib/utils'
import { forwardRef } from 'react'

/**
 * Reusable Input component following design system
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {React.ReactNode} leftIcon - Icon on the left
 * @param {React.ReactNode} rightIcon - Icon on the right
 * @param {string} className - Additional classes for input
 * @param {string} wrapperClassName - Additional classes for wrapper
 */
const Input = forwardRef(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className,
    wrapperClassName,
    id,
    required,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

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
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
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
                        'outline-none',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        leftIcon && 'pl-11',
                        rightIcon && 'pr-11',
                        className
                    )}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        {rightIcon}
                    </div>
                )}
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

Input.displayName = 'Input'

export default Input
