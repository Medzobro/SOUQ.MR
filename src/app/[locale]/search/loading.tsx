export default function SearchLoading() {
  return (
    <div style={{ paddingTop: 80, paddingBottom: 100 }}>
      <div style={{ padding: '0 20px 24px' }}>
        <div className="skeleton" style={{ height: 48, borderRadius: 14, width: '100%' }} />
      </div>
      <div className="section">
        <div className="skeleton" style={{ height: 20, width: 120, marginBottom: 16 }} />
        <div className="products-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="product-card" style={{ pointerEvents: 'none' }}>
              <div className="skeleton" style={{ height: 180, borderRadius: 0 }} />
              <div style={{ padding: 14 }}>
                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 20, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
