export default function SkeletonShift() {
  return (
    <div
      className="animate-pulse"
      style={{
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(232, 93, 47, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          {/* Title skeleton */}
          <div
            style={{
              height: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              width: '70%',
              marginBottom: '8px',
            }}
          />
        </div>
        {/* Badge skeleton */}
        <div
          style={{
            height: '24px',
            width: '80px',
            background: 'rgba(74, 222, 128, 0.1)',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Info rows */}
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Icon skeleton */}
            <div
              style={{
                width: '16px',
                height: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
              }}
            />
            {/* Text skeleton */}
            <div
              style={{
                height: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                width: `${Math.random() * 40 + 40}%`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
