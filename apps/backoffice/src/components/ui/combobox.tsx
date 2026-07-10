import { useEffect, useRef, useState } from "react";
import { Input } from "./input";

export interface ComboboxOption {
  value: string;
  label: string;
}

// Searchable single-select: filters options by label OR value as you type.
// Used for the world country/currency pickers (hundreds of options).
export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  id,
  disabled,
  invalid,
  maxResults = 50,
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  maxResults?: number;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = options.find((o) => o.value === value);
  const q = query.trim().toLowerCase();
  const filtered = (
    q
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(q) ||
            o.value.toLowerCase().includes(q),
        )
      : options
  ).slice(0, maxResults);

  return (
    <div ref={ref} className="relative">
      <Input
        id={id}
        autoComplete="off"
        disabled={disabled}
        aria-invalid={invalid ? true : undefined}
        placeholder={placeholder}
        value={open ? query : selected ? selected.label : value}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm hover:bg-slate-100"
                onClick={() => {
                  onChange(o.value);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span className="truncate">{o.label}</span>
                <span className="shrink-0 font-mono text-xs text-slate-400">
                  {o.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
