"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

interface AdminFiltersProps {
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters?: FilterGroup[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

export function AdminFilters({
  searchPlaceholder = "Buscar...",
  searchQuery,
  onSearchChange,
  filters = [],
  onClearFilters,
  showClearButton = false,
}: AdminFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 py-3 pr-10 pl-11 text-sm font-medium placeholder-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white text-slate-800"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="flex flex-wrap items-center gap-4">
        {filters.map((group) => (
          <div key={group.key} className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block sm:inline">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const isSelected = group.selectedValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => group.onValueChange(option.value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100/80"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Clear Filters Button */}
        {showClearButton && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
