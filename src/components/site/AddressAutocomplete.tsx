import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { fetchAddressSuggestions, hasMapboxToken, type AddressSuggestion } from "@/lib/mapbox";
import { cn } from "@/lib/utils";

type AddressAutocompleteProps = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Fired when the customer picks a suggestion or commits free text. */
  onCommit: (value: string) => void;
  /** Fired when a suggestion is picked — provides parsed city/state/zip. */
  onSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
};

export function AddressAutocomplete({
  id,
  value,
  onValueChange,
  onCommit,
  onSelect,
  placeholder,
  loading = false,
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [openList, setOpenList] = useState(false);
  const [fetching, setFetching] = useState(false);
  const skipNextFetch = useRef(false);

  useEffect(() => {
    if (!hasMapboxToken) return;
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    // Debounced so typing feels instant and we do not bill a request per keypress.
    const timer = setTimeout(() => {
      setFetching(true);
      fetchAddressSuggestions(value)
        .then((results) => {
          if (cancelled) return;
          setSuggestions(results.slice(0, 5));
          setOpenList(results.length > 0);
        })
        .catch((err) => {
          console.error("[AddressAutocomplete] suggestion fetch failed:", err);
          if (!cancelled) setSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setFetching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  const select = (suggestion: AddressSuggestion) => {
    skipNextFetch.current = true;
    setSuggestions([]);
    setOpenList(false);
    onValueChange(suggestion.description);
    onSelect?.(suggestion);
    onCommit(suggestion.description);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={() => {
          setTimeout(() => setOpenList(false), 120);
          if (value.trim()) onCommit(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const first = suggestions[0];
            if (first) select(first);
            else if (value.trim()) onCommit(value);
          }
          if (e.key === "Escape") setOpenList(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={openList}
        className="pr-9"
      />
      {(fetching || loading) && (
        <Loader2
          className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      )}

      {openList && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-pop"
        >
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(s)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-muted"
              >
                {s.description}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
