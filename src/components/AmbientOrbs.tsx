export default function AmbientOrbs() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: '30vw',
          aspectRatio: '1',
          borderRadius: '999px',
          filter: 'blur(40px)',
          opacity: 0.22,
          mixBlendMode: 'screen',
          left: '-8vw',
          top: '15vh',
          background: 'rgba(232, 148, 26, 0.35)',
          animation: 'orbDrift 18s ease-in-out infinite alternate',
        }}
      />
      <span
        style={{
          position: 'absolute',
          width: '28vw',
          aspectRatio: '1',
          borderRadius: '999px',
          filter: 'blur(44px)',
          opacity: 0.18,
          mixBlendMode: 'screen',
          right: '-6vw',
          top: '8vh',
          background: 'rgba(78, 205, 196, 0.25)',
          animation: 'orbDrift 22s ease-in-out infinite alternate',
          animationDelay: '-5s',
        }}
      />
      <span
        style={{
          position: 'absolute',
          width: '32vw',
          aspectRatio: '1',
          borderRadius: '999px',
          filter: 'blur(48px)',
          opacity: 0.15,
          mixBlendMode: 'screen',
          left: '30vw',
          bottom: '-18vw',
          background: 'rgba(167, 139, 250, 0.3)',
          animation: 'orbDrift 20s ease-in-out infinite alternate',
          animationDelay: '-10s',
        }}
      />
    </div>
  )
}
