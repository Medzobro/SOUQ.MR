export default function MessageLoading() {
  return (
    <div className="chat-page">
      <div className="chat-loading-skeleton">
        <div className="skeleton-header" />
        <div className="skeleton-bubble-left" />
        <div className="skeleton-bubble-right" />
        <div className="skeleton-bubble-left" />
        <div className="skeleton-composer" />
      </div>
    </div>
  );
}
