"use client";

import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cx } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

type OpenDirection = "down" | "up";

export function AdaptiveSelect({
  ariaLabel,
  className,
  defaultValue = "",
  disabled = false,
  label,
  name,
  onValueChange,
  options,
  value,
}: {
  ariaLabel?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  label: string;
  name?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  value?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<OpenDirection>("down");
  const selectedValue = value ?? internalValue;
  const selectedIndex = options.findIndex(
    (option) => option.value === selectedValue,
  );
  const [highlightedIndex, setHighlightedIndex] = useState(
    Math.max(selectedIndex, 0),
  );
  const selectedOption = useMemo(
    () =>
      options.find((option) => option.value === selectedValue) ?? options[0],
    [options, selectedValue],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateDirection = () => {
      const button = buttonRef.current;

      if (!button) {
        return;
      }

      const rect = button.getBoundingClientRect();
      const belowSpace = window.innerHeight - rect.bottom;
      const aboveSpace = rect.top;

      setDirection(belowSpace < 260 && aboveSpace > belowSpace ? "up" : "down");
    };

    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection, true);

    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const commitValue = (nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const openListbox = () => {
    setHighlightedIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  };

  const moveHighlight = (directionOffset: 1 | -1) => {
    setHighlightedIndex((currentIndex) => {
      const nextIndex =
        (currentIndex + directionOffset + options.length) % options.length;

      return nextIndex;
    });
  };

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openListbox();
      }
      moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (isOpen) {
        commitValue(options[highlightedIndex]?.value ?? selectedValue);
        return;
      }

      openListbox();
    }
  };

  return (
    <div className={cx("relative min-w-0", className)} ref={rootRef}>
      {name ? (
        <input name={name} readOnly type="hidden" value={selectedValue} />
      ) : null}
      <button
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel ?? label}
        className="app-input flex h-11 w-full min-w-0 items-center justify-between gap-3 pl-3 pr-11 text-left text-sm hover:bg-[var(--color-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-soft)] disabled:opacity-70"
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }

          openListbox();
        }}
        onKeyDown={handleButtonKeyDown}
        ref={buttonRef}
        type="button"
      >
        <span className="truncate">{selectedOption?.label ?? label}</span>
        <ChevronDown
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute right-3 top-1/2 shrink-0 -translate-y-1/2 text-[var(--color-muted)] transition-transform",
            isOpen && "rotate-180",
          )}
          size={16}
          strokeWidth={1.8}
        />
      </button>

      {isOpen ? (
        <div
          className={cx(
            "absolute left-0 z-50 w-full min-w-44 overflow-hidden rounded-md border border-[var(--color-hairline)] bg-[var(--color-panel)] p-1 shadow-lg",
            direction === "down" ? "top-full mt-1" : "bottom-full mb-1",
          )}
          id={listboxId}
          role="listbox"
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  aria-selected={isSelected}
                  className={cx(
                    "flex min-h-9 w-full min-w-0 items-center rounded px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
                    isSelected &&
                      "bg-[var(--color-info-bg)] font-medium text-[var(--color-info)] hover:bg-[var(--color-info-bg)]",
                    !isSelected &&
                      "text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]",
                    isHighlighted && !isSelected && "bg-[var(--color-surface-soft)]",
                  )}
                  key={option.value}
                  onClick={() => commitValue(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  type="button"
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
