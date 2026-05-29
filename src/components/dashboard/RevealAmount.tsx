'use client';

import { Popover } from '@base-ui/react/popover';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';

interface RevealAmountProps {
  /** The raw shekel amount. Shown compact (1.04M ₪); exact figure on hover/tap. */
  value: number;
  /** Styling for the visible (compact) number — size, weight, color, etc. */
  className?: string;
}

// Render the number and ₪ as separate flex children in an LTR row. This pins
// the visual order to the DOM order (number, then ₪ on its right) regardless of
// the bidi algorithm — iOS Safari otherwise floats the trailing ₪ to the LEFT
// of a digits-only amount, since it lacks a strong-LTR neighbour like "K"/"M".
function Amount({ text, className }: { text: string; className?: string }) {
  const i = text.lastIndexOf('₪');
  const num = (i >= 0 ? text.slice(0, i) : text).trimEnd();
  return (
    <span dir="ltr" className={cn('inline-flex items-baseline gap-[0.25em] tabular-nums', className)}>
      <span>{num}</span>
      {i >= 0 && <span>₪</span>}
    </span>
  );
}

// Dotted border-bottom (not text-decoration, which doesn't paint on the flex
// row above) in the number's own colour, as a subtle "tap me" affordance.
const triggerBase =
  'inline-flex items-baseline cursor-pointer rounded-sm outline-none ' +
  'border-b border-dotted [border-bottom-color:color-mix(in_oklab,currentColor,transparent_55%)] ' +
  'focus-visible:ring-2 focus-visible:ring-teal/40';

/**
 * Renders a compact currency value (e.g. "-40K ₪") that reveals the exact
 * amount ("-40,099 ₪") in a small bubble — on hover (desktop) or tap (mobile).
 * Keyboard-focusable; Escape and outside-click close it. The bubble opens
 * downward so it clears the progress ring above the first stat, and flips to
 * stay on screen near edges. Layout never shifts.
 */
export function RevealAmount({ value, className }: RevealAmountProps) {
  const compact = formatCurrencyCompact(value);
  const exact = formatCurrency(value);

  // For small amounts the compact form already IS the exact figure — no point
  // in a bubble that repeats the same number.
  if (compact === exact) {
    return <Amount text={compact} className={className} />;
  }

  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={120}
        closeDelay={0}
        aria-label={`${compact}, מדויק ${exact}`}
        className={cn(triggerBase, className)}
      >
        <Amount text={compact} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" sideOffset={6} align="center" collisionPadding={8} className="isolate z-50">
          <Popover.Popup
            className="z-50 w-fit whitespace-nowrap rounded-md bg-teal-dark px-2.5 py-1 text-xs font-bold text-cream shadow-warm-md ring-1 ring-cream/20 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <Amount text={exact} />
            <Popover.Arrow className="z-50 size-2 translate-y-[calc(-50%-1px)] rotate-45 rounded-[1px] bg-teal-dark data-[side=bottom]:top-1 data-[side=top]:-bottom-1" />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
