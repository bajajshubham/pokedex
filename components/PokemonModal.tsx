type PokemonDetails = {
  id: number
  name: string
  height: number
  weight: number
  sprites: { front_default: string | null }
  abilities: { ability: { name: string } }[]
  types: { type: { name: string } }[]
}

type ModalProps = {
  details: PokemonDetails,
  closeModal: () => void
}

export default function PokemonModal({ details, closeModal }: ModalProps) {
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

      onClick={closeModal}
    >
      <div
        style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', minWidth: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{details.name.toUpperCase()}</h2>
        <img src={details.sprites.front_default || ''} alt={details.name} />
        <p>ID: {details.id}</p>
        <p>Height: {details.height}</p>
        <p>Weight: {details.weight}</p>
        <p>Types: {details.types.map(t => t.type.name).join(', ')}</p>
        <p>Abilities: {details.abilities.map(a => a.ability.name).join(', ')}</p>
        <button style={{ marginTop: '1rem' }} onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  )
}
