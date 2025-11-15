"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const scrollPositionRef = React.useRef(0);
  
  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (props.open) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;
      
      // Lock the body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position after styles are reset
      window.scrollTo(0, scrollPositionRef.current);
    }
    
    return () => {
      if (!props.open) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [props.open]);

  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const childrenArray = React.Children.toArray(children);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasHeader = childrenArray.some((child: any) => 
    child?.props?.['data-slot'] === 'dialog-header' || 
    child?.type?.displayName === 'DialogHeader' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (typeof child === 'object' && child !== null && 'type' in child && (child.type as any)?.displayName === 'DialogHeader')
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasFooter = childrenArray.some((child: any) => 
    child?.props?.['data-slot'] === 'dialog-footer' || 
    child?.type?.displayName === 'DialogFooter' ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (typeof child === 'object' && child !== null && 'type' in child && (child.type as any)?.displayName === 'DialogFooter')
  );

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed z-50 flex flex-col w-full max-w-[calc(100%-2rem)] max-h-[95vh] rounded-2xl border border-gray-200 shadow-2xl duration-200 overflow-hidden",
          // Mobile: bottom positioning with slide-up animation
          "bottom-0 left-[50%] translate-x-[-50%] translate-y-0 data-[state=closed]:translate-y-full data-[state=open]:translate-y-0 rounded-b-none",
          // Desktop: center positioning with zoom animation - completely override mobile positioning
          "sm:!bottom-auto sm:!top-[50%] sm:!translate-y-[-50%] sm:data-[state=closed]:!translate-y-[-50%] sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:max-w-lg sm:max-h-[90vh] sm:rounded-b-2xl",
          className
        )}
        {...props}
      >
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {hasHeader || hasFooter ? (
            <>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {childrenArray.filter((child: any) => 
                child?.props?.['data-slot'] === 'dialog-header' || 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (typeof child === 'object' && child !== null && 'type' in child && (child.type as any)?.displayName === 'DialogHeader')
              )}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 sm:px-6 sm:py-4 min-h-0">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {childrenArray.filter((child: any) => 
                  child?.props?.['data-slot'] !== 'dialog-header' && 
                  child?.props?.['data-slot'] !== 'dialog-footer' &&
                  !((typeof child === 'object' && child !== null && 'type' in child && 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ((child.type as any)?.displayName === 'DialogHeader' || 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (child.type as any)?.displayName === 'DialogFooter')))
                )}
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {childrenArray.filter((child: any) => 
                child?.props?.['data-slot'] === 'dialog-footer' || 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (typeof child === 'object' && child !== null && 'type' in child && (child.type as any)?.displayName === 'DialogFooter')
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 sm:px-6 sm:py-4 min-h-0">
              {children}
            </div>
          )}
        </div>
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 z-10 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

const DialogHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="dialog-header"
        className={cn(
          "sticky top-0 z-10 flex flex-col gap-2 text-center sm:text-left shrink-0 border-b border-gray-200 bg-white px-6 py-4 sm:px-6 sm:py-4 rounded-t-2xl",
          className
        )}
        {...props}
      />
    )
  }
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="dialog-footer"
        className={cn(
          "sticky bottom-0 z-10 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:px-6 sm:py-4 rounded-b-2xl",
          className
        )}
        {...props}
      />
    )
  }
)
DialogFooter.displayName = "DialogFooter"

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
