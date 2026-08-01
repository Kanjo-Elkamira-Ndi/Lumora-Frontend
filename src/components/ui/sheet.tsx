import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        className
      )}
      {...props}
    />
  );
}

const sheetVariants = cva(
  "fixed z-50 flex flex-col gap-4 bg-[var(--color-surface-1)] text-[var(--color-text-primary)] shadow-2xl transition-transform data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-[var(--color-border)]",
        bottom: "inset-x-0 bottom-0 border-t border-[var(--color-border)]",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-[var(--color-border)] sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l border-[var(--color-border)] sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetVariants>) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("font-semibold text-[var(--color-text-primary)]", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-[var(--color-text-secondary)]", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetTitle,
  SheetDescription,
};
