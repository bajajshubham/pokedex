export default function PokemonModal() {
  return (
    <div
      className="fixed"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button style={{ marginTop: '1rem' }}>
          Close
        </button>
      </div>
    </div>
  )
}
