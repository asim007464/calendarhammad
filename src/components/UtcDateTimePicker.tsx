"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildUtcPickerValue,
  parseUtcPickerValue,
  utcPickerValueToDisplay,
} from "@/lib/utcDateTime";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function utcToday() {
  const now = new Date();
  return { y: now.getUTCFullYear(), m: now.getUTCMonth(), d: now.getUTCDate() };
}

function daysInUtcMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

function utcWeekday(y: number, m: number, d: number) {
  const day = new Date(Date.UTC(y, m, d)).getUTCDay();
  return day === 0 ? 6 : day - 1;
}

interface UtcDateTimePickerProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function UtcDateTimePicker({ label, name, value, onChange, required }: UtcDateTimePickerProps) {
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseUtcPickerValue(value);
  const today = utcToday();
  const viewY = parsed?.y ?? today.y;
  const viewM = parsed?.m ?? today.m;
  const [viewYear, setViewYear] = useState(viewY);
  const [viewMonth, setViewMonth] = useState(viewM);

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.y);
      setViewMonth(parsed.m);
    }
  }, [value, parsed?.y, parsed?.m]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function shiftMonth(delta: number) {
    let y = viewYear;
    let m = viewMonth + delta;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewYear(y);
    setViewMonth(m);
  }

  function selectDay(day: number) {
    const base = parsed ?? { y: viewYear, m: viewMonth, d: day, h: 12, min: 0 };
    onChange(buildUtcPickerValue({ y: viewYear, m: viewMonth, d: day, h: base.h, min: base.min }));
  }

  function updateTime(field: "h" | "min", raw: string) {
    const n = Math.max(0, Math.min(field === "h" ? 23 : 59, Number(raw) || 0));
    const base = parsed ?? { y: today.y, m: today.m, d: today.d, h: 12, min: 0 };
    onChange(buildUtcPickerValue({ ...base, [field]: n }));
  }

  const firstDow = utcWeekday(viewYear, viewMonth, 1);
  const totalDays = daysInUtcMonth(viewYear, viewMonth);
  const prevDays = daysInUtcMonth(viewYear, viewMonth - 1);
  const cells: { day: number; inMonth: boolean }[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, inMonth: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ day: d, inMonth: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, inMonth: false });
  }

  return (
    <div className="field dt-picker-field" ref={wrapRef}>
      <span id={`${id}-label`}>{label}</span>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        className="dt-picker-trigger no-cap"
        aria-labelledby={`${id}-label`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? "" : "dt-picker-placeholder"}>
          {utcPickerValueToDisplay(value)}
        </span>
        <Calendar size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="dt-picker-pop panel" role="dialog" aria-label={`${label} calendar`}>
          <div className="dt-picker-head">
            <button type="button" className="icon-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <strong>{MONTHS[viewMonth]} {viewYear}</strong>
            <button type="button" className="icon-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cal-grid weekdays dt-picker-weekdays">
            {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
          </div>

          <div className="cal-grid dt-picker-days">
            {cells.map((cell, i) => {
              const selected =
                cell.inMonth &&
                parsed &&
                parsed.y === viewYear &&
                parsed.m === viewMonth &&
                parsed.d === cell.day;
              const isToday =
                cell.inMonth &&
                today.y === viewYear &&
                today.m === viewMonth &&
                today.d === cell.day;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!cell.inMonth}
                  className={[
                    "dt-picker-day",
                    !cell.inMonth ? "other" : "",
                    selected ? "selected" : "",
                    isToday ? "today" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => cell.inMonth && selectDay(cell.day)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="dt-picker-time">
            <span>Time (UTC)</span>
            <div className="dt-picker-time-inputs">
              <input
                type="number"
                min={0}
                max={23}
                value={parsed?.h ?? 12}
                onChange={(e) => updateTime("h", e.target.value)}
                aria-label="Hour UTC"
              />
              <span>:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={parsed?.min ?? 0}
                onChange={(e) => updateTime("min", e.target.value)}
                aria-label="Minute UTC"
              />
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-sm dt-picker-done" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
