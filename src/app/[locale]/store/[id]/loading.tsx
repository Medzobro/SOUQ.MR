export default function StoreLoading() {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="store-cover" style={{ height: 220 }}>
        <div className="skeleton" style={{ height: '100%', borderRadius: 0 }} />
      </div>
      <div style={{ padding: '0 20px', transform: 'translateY(-36px)' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          <div className="skeleton" style={{ width: 72, height: 72, borderRadius: 18 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div className="skeleton" style={{ height: 40, width: '100%', borderRadius: 12, marginBottom: 20 }} />
        <div className="products-grid">
          {Array.from({ length: 4 }).map((_, i) => (
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
