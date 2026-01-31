import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from './Button'

/**
 * Reusable Modal component with accessibility features
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} showCloseButton - Show X button in header
 * @param {string} className - Additional classes for content
 */
export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    className,
    ...props
}) {
    const modalRef = useRef(null)
    const previousFocusRef = useRef(null)

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Handle focus management (Separate from listeners to prevent re-triggering on onClose change)
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement
            // Small delay to ensure the modal is rendered before focusing
            const timer = setTimeout(() => {
                modalRef.current?.focus()
            }, 0)
            return () => clearTimeout(timer)
        } else {
            // Restore focus when closing
            if (previousFocusRef.current) {
                previousFocusRef.current.focus()
                previousFocusRef.current = null
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose()
                }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className={cn(
                    'bg-[#121217] border border-white/10 rounded-2xl w-full shadow-2xl',
                    'animate-fade-in',
                    'overflow-y-auto max-h-[90vh]',
                    sizes[size],
                    className
                )}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        {title && (
                            <h2
                                id="modal-title"
                                className="text-xl font-bold text-white"
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-zinc-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1 outline-none"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}

/**
 * Modal Footer component for action buttons
 */
export function ModalFooter({ children, className }) {
    return (
        <div className={cn(
            'flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-6',
            className
        )}>
            {children}
        </div>
    )
}
