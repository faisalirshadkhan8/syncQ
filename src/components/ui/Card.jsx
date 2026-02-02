import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { useGsapHoverScale } from '@/hooks/useGsap';

const Card = forwardRef(({
    className,
    variant = 'default', // default | interactive | glass
    hover = false, // explicit hover opt-in
    children,
    ...props
}, ref) => {

    // Enable hover effect if variant is interactive OR hover prop is true
    const shouldHover = variant === 'interactive' || hover;
    const hoverRef = useGsapHoverScale({ scale: shouldHover ? 1.015 : 1, duration: 0.3 });

    return (
        <div
            ref={(node) => {
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
                if (shouldHover) hoverRef.current = node;
            }}
            className={cn(
                "card p-6 border-slate-200 bg-white shadow-sm", // Light mode defaults
                shouldHover && "cursor-pointer transition-colors duration-300 hover:border-teal-brand-500/50 hover:shadow-md",
                variant === 'default',
                variant === 'interactive' && "card-interactive",
                variant === 'glass' && "glass bg-transparent",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = "Card";

export default Card;
