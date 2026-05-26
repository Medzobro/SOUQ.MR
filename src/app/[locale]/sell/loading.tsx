export default function SellLoading() {
  return (
    <div style={{ paddingTop: 80, paddingBottom: 100, paddingInline: 20 }}>
      <div className="skeleton" style={{ height: 28, width: 160, marginBottom: 24 }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 48, borderRadius: 14, width: '100%' }} />
        </div>
      ))}
      <div className="skeleton" style={{ height: 52, borderRadius: 14, width: '100%', marginTop: 8 }} />
    </div>
  );
}
