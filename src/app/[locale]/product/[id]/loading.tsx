export default function ProductLoading() {
  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="product-gallery" style={{ height: '50vh' }}>
        <div className="skeleton" style={{ height: '100%', borderRadius: 0 }} />
      </div>
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 50, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 28, width: '90%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 36, width: '40%', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div className="skeleton" style={{ height: 20, width: 60 }} />
          <div className="skeleton" style={{ height: 20, width: 80 }} />
          <div className="skeleton" style={{ height: 20, width: 50 }} />
        </div>
        <div className="skeleton" style={{ height: 80, width: '100%', marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
          <div className="skeleton" style={{ height: 48, borderRadius: 14 }} />
          <div className="skeleton" style={{ height: 48, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}
