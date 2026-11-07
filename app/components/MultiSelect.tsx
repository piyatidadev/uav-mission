"use client";

// Multi-select dropdown เขียนเองด้วย React (ไม่ใช้ UI library)
// - พิมพ์เพื่อกรองรายการ
// - คลิกนอกกล่องแล้วปิด
// - ใช้คีย์บอร์ดได้: ↑/↓ เลื่อน, Enter เลือก/ยกเลิก, Esc ปิด, Backspace (ตอนช่องว่าง) ลบตัวสุดท้าย

import { useEffect, useId, useRef, useState } from "react";

export type Option = {
  value: string;
  label: string;
  className?: string; // สีของป้ายที่เลือกแล้ว
};

type Props = {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export default function MultiSelect({ label, options, selected, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // useId ทำให้ id ไม่ซ้ำกัน ถ้ามี MultiSelect หลายอันในหน้าเดียว
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const filtered = options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedOptions = options.filter((o) => selected.includes(o.value));

  // ปิดเมื่อคลิกนอกพื้นที่ (ฟังเฉพาะตอนเปิดอยู่ และถอด listener ออกตอนปิด)
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // เลื่อนรายการให้เห็นตัวที่กำลังเลือกอยู่ (ตอนกดลูกศร)
  useEffect(() => {
    if (open) {
      document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, open]);

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function openList() {
    setOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(filtered.length - 1);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (filtered[activeIndex]) {
          toggle(filtered[activeIndex].value);
        }
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Backspace":
        if (query === "" && selected.length > 0) {
          onChange(selected.slice(0, -1));
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <span id={labelId} className="mb-1 block text-sm font-medium">
        {label}
      </span>

      {/* กล่องแสดงตัวที่เลือก + ช่องพิมพ์ คลิกตรงไหนก็ได้เพื่อเปิด */}
      <div
        onClick={() => {
          inputRef.current?.focus();
          openList();
        }}
        className={`flex min-h-[42px] w-full cursor-text flex-wrap items-center gap-1 rounded border bg-white px-2 py-1 ${
          open ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"
        }`}
      >
        {selectedOptions.map((o) => (
          <span
            key={o.value}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm ${o.className ?? "bg-gray-100"}`}
          >
            {o.label}
            <button
              type="button"
              aria-label={`เอา ${o.label} ออก`}
              onClick={(e) => {
                e.stopPropagation();
                toggle(o.value);
              }}
              className="rounded-full px-1 leading-none hover:bg-black/10"
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-labelledby={labelId}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? optionId(activeIndex) : undefined}
          value={query}
          placeholder={selected.length === 0 ? placeholder : ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          className="min-w-24 flex-1 py-1 outline-none"
        />

        <span aria-hidden className="text-gray-400">
          ▾
        </span>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          aria-multiselectable="true"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-300 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">ไม่พบตัวเลือก</li>}
          {filtered.map((o, i) => {
            const isSelected = selected.includes(o.value);
            return (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                // preventDefault ตอน mousedown เพื่อไม่ให้ช่องพิมพ์เสีย focus
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(o.value)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                  i === activeIndex ? "bg-blue-50" : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`flex size-4 items-center justify-center rounded border text-xs ${
                    isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-400"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
