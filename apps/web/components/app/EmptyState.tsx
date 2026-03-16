interface EmptyStateProps {
  onCreateClick?: () => void
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
        {/* Wedding envelope illustration — Stitch palette */}
        <rect x="10" y="30" width="100" height="70" rx="8" fill="#fce8ed" stroke="#e6dbde" strokeWidth="2" />
        <path d="M10 38 L60 72 L110 38" stroke="#ec1349" strokeWidth="2" fill="none" opacity="0.4" />
        <circle cx="85" cy="25" r="12" fill="#fce8ed" stroke="#e6dbde" strokeWidth="1.5" />
        <path d="M82 25 L85 22 L88 25 L85 28Z" fill="#ec1349" opacity="0.6" />
      </svg>
      <div>
        <h2 className="text-xl font-bold text-[#181113] mb-2">
          Bắt đầu hành trình của bạn
        </h2>
        <p className="text-sm text-[#5e4d52] max-w-xs mx-auto">
          Tạo thiệp cưới trực tuyến đẹp mắt và chia sẻ với khách mời trong vài phút.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 rounded-lg bg-[#ec1349] text-white text-sm font-bold hover:bg-[#d01140] transition-colors shadow-lg shadow-[#ec1349]/20 active:scale-95"
      >
        Tạo thiệp cưới đầu tiên của bạn
      </button>
    </div>
  )
}
