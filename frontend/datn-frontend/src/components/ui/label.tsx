import * as React from "react"

import { cn } from "@/lib/utils"

const Label = React.forwardRef<React.ElementRef<"label">, React.ComponentPropsWithoutRef<"label">>(
    ({ className, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={cn("block text-sm font-medium text-gray-700 mb-1", className)}
                {...props}
            />
        )
    }
)
Label.displayName = "Label"

export { Label }
