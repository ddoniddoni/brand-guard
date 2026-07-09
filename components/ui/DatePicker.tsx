"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { cx } from "@/lib/utils";

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

type OpenDirection = "down" | "up";

export function DatePicker({
  id,
  label,
  name,
  onBlur,
  onChange,
  placeholder = "날짜 선택",
  value,
}: {
  id: string;
  label: string;
  name?: string;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<OpenDirection>("down");
  const parsedValue = parseDateValue(value);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(parsedValue ?? new Date()),
  );
  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateDirection = () => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      const rect = input.getBoundingClientRect();
      const belowSpace = window.innerHeight - rect.bottom;
      const aboveSpace = rect.top;

      setDirection(belowSpace < 390 && aboveSpace > belowSpace ? "up" : "down");
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectDate = (date: Date) => {
    onChange(formatDateValue(date));
    setVisibleMonth(startOfMonth(date));
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  };

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <div className="relative">
        <input
          aria-label={label}
          className="app-input h-11 w-full min-w-0 px-3 pr-11 text-sm placeholder:text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          id={id}
          inputMode="numeric"
          name={name}
          onBlur={onBlur}
          onChange={(event) => {
            onChange(event.target.value);
            const nextDate = parseDateValue(event.target.value);

            if (nextDate) {
              setVisibleMonth(startOfMonth(nextDate));
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          ref={inputRef}
          type="text"
          value={value}
        />
        <button
          aria-expanded={isOpen}
          aria-label="달력 열기"
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          onClick={() => setIsOpen((current) => !current)}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <CalendarDays aria-hidden="true" size={17} strokeWidth={1.8} />
        </button>
      </div>

      {isOpen ? (
        <div
          className={cx(
            "absolute left-0 z-50 w-[min(100vw-2.5rem,340px)] rounded-xl border border-[var(--color-hairline)] bg-[var(--color-panel)] p-3 shadow-[var(--color-panel-shadow)]",
            direction === "down" ? "top-full mt-2" : "bottom-full mb-2",
          )}
          role="dialog"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">
                {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                게시 예정일
              </p>
            </div>
            <div className="flex items-center gap-1">
              <CalendarNavButton
                label="이전 연도"
                onClick={() => moveMonth(-12)}
              >
                <ChevronsLeft aria-hidden="true" size={15} strokeWidth={1.8} />
              </CalendarNavButton>
              <CalendarNavButton label="이전 달" onClick={() => moveMonth(-1)}>
                <ChevronLeft aria-hidden="true" size={15} strokeWidth={1.8} />
              </CalendarNavButton>
              <CalendarNavButton label="다음 달" onClick={() => moveMonth(1)}>
                <ChevronRight aria-hidden="true" size={15} strokeWidth={1.8} />
              </CalendarNavButton>
              <CalendarNavButton label="다음 연도" onClick={() => moveMonth(12)}>
                <ChevronsRight aria-hidden="true" size={15} strokeWidth={1.8} />
              </CalendarNavButton>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {dayLabels.map((dayLabel) => (
              <span
                className="grid h-7 place-items-center text-xs font-medium text-[var(--color-muted)]"
                key={dayLabel}
              >
                {dayLabel}
              </span>
            ))}

            {calendarDays.map((day) => {
              const dayValue = formatDateValue(day.date);
              const isSelected = dayValue === value;
              const isToday = dayValue === formatDateValue(new Date());

              return (
                <button
                  aria-current={isToday ? "date" : undefined}
                  className={cx(
                    "grid aspect-square min-h-9 place-items-center rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
                    !day.isCurrentMonth && !isSelected && "text-[var(--color-muted)] opacity-60",
                    isToday &&
                      "border border-[var(--color-hairline)] font-medium text-[var(--color-ink)]",
                    isSelected
                      ? "border border-[var(--color-primary)] bg-[var(--color-primary)] font-medium text-white hover:bg-[var(--color-primary-active)]"
                      : day.isCurrentMonth &&
                        "text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]",
                  )}
                  key={dayValue}
                  onClick={() => selectDate(day.date)}
                  type="button"
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarNavButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid size-8 place-items-center rounded-md text-[var(--color-muted)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function buildCalendarDays(visibleMonth: Date) {
  const firstDay = startOfMonth(visibleMonth);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
    };
  });
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
