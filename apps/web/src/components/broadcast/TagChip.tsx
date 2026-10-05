"use client";

export default function TagChip({
    label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-sm border transition-all
      ${active
                    ? "bg-slate-900 text-white border-slate-900 font-medium"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"}`}
        >
            {label}
        </button>
    );
}
