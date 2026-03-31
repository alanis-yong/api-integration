export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__image skeleton-shimmer" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-card__line--short skeleton-shimmer" />
        <div className="skeleton-card__line skeleton-shimmer" />
        <div className="skeleton-card__line skeleton-card__line--medium skeleton-shimmer" />
      </div>
      <div className="skeleton-card__footer">
        <div className="skeleton-card__line skeleton-card__line--price skeleton-shimmer" />
        <div className="skeleton-card__line skeleton-card__line--btn skeleton-shimmer" />
      </div>
    </div>
  )
}
