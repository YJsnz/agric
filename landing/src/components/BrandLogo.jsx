import brandLogo from '../brand-logo.png'

export default function BrandLogo({ inverse = false, compact = false }) {
  return (
    <span className="inline-flex min-w-max items-center gap-3">
      <span
        className={`${compact ? 'h-10 w-10' : 'h-11 w-11'} relative block shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5`}
      >
        <img
          src={brandLogo}
          alt=""
          aria-hidden="true"
          className="absolute left-1/2 top-0 w-[138%] max-w-none -translate-x-1/2"
        />
      </span>
      <span className="flex flex-col leading-none">
        <strong className={`${compact ? 'text-base' : 'text-lg'} font-semibold tracking-tight ${inverse ? 'text-white' : 'text-ink'}`}>
          田言耕智
        </strong>
        {!compact && (
          <small className={`mt-1.5 text-[10px] font-light tracking-[0.12em] ${inverse ? 'text-white/65' : 'text-muted'}`}>
            智慧农业 AI 平台
          </small>
        )}
      </span>
    </span>
  )
}
