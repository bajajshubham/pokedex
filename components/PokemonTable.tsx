import { useRouter } from "next/router"

type Pokemon = {
  name: string
  url: string
}

interface Data {
  data: Pokemon[]
}

export default function PokemonTable({ data }: Data) {
  const router = useRouter()


  function openModal(name: string) {
    const query = new URLSearchParams({ ...router.query, pokemon: name }).toString()
    router.push(`/?${query}`, undefined, { shallow: false })

  }

  return (
    <table border={1} cellPadding={8} cellSpacing={0} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>URL</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={2} style={{ textAlign: 'center' }}>
              No Pokémons found
            </td>
          </tr>
        ) : (
          data.map((pokemon) => (
            <tr key={pokemon.name} style={{ cursor: 'pointer' }} onClick={() => openModal(pokemon.name)} >
              <td>{pokemon.name}</td>
              <td>
                <a href={pokemon.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  {pokemon.url}
                </a>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )

}