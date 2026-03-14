interface EmptyStateProps {
  onCreateClick?: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Simple wedding envelope illustration */}
        <rect x="10" y="30" width="100" height="70" rx="8" fill="#fdf2f8" stroke="#fbcfe8" strokeWidth="2" />
        <path d="M10 38 L60 72 L110 38" stroke="#f9a8d4" strokeWidth="2" fill="none" />
        <circle cx="85" cy="25" r="12" fill="#fce7f3" stroke="#fbcfe8" strokeWidth="1.5" />
      </svg>
      <div>
        <h2 className="text-xl font-semibold text-rose-800 mb-2">
          {"B\u1eaft \u0111\u1ea7u h\u00e0nh tr\u00ecnh c\u1ee7a b\u1ea1n"}
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          {"T\u1ea1o thi\u1ec7p c\u01b0\u1edbi tr\u1ef1c tuy\u1ebfn \u0111\u1eb9p m\u1eaft v\u00e0 chia s\u1ebb v\u1edbi kh\u00e1ch m\u1eddi trong v\u00e0i ph\u00fat."}
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm"
      >
        {"T\u1ea1o thi\u1ec7p c\u01b0\u1edbi \u0111\u1ea7u ti\u00ean c\u1ee7a b\u1ea1n"}
      </button>
    </div>
  )
}
