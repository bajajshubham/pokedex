import PokemonModal from "@/components/PokemonModal"
import PokemonTable from "@/components/PokemonTable"
import { InferGetServerSidePropsType } from "next"
import { useRouter } from "next/router"
import { useState } from "react"

type Pokemon = {
  name: string
  url: string
}

interface Props {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}

export default function Page({ pokemons, totalCount, page, filterName }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [searchedValue, setSearchedValue] = useState(filterName)

  function goToPage(newPage: number) {
    router.push(`/?page=${newPage}`)
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/?name=${searchedValue.trim()}&page=1`)
  }

  // Render data...
  return (
    <div className="p-5">
      <h1>Pokédex</h1>

      <form className="mb-5" onSubmit={onSearchSubmit}>
        <input
          className="mx-1.5"
          type="text"
          placeholder="Filter by exact name"
          value={searchedValue}
          onChange={(e) => setSearchedValue(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <PokemonTable data={pokemons} />


      <div className="mt-5">
        <button onClick={() => goToPage(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span className="mx-2.5">Page {page}</span>
        <button onClick={() => goToPage(page + 1)} disabled={page * 20 >= totalCount}>
          Next
        </button>
      </div>


      <PokemonModal />
    </div>
  )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const page: number = Number(context.query.page) || 1
  const filterName = (context.query.name as string) || ''

  if (filterName) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${filterName.toLowerCase()}`)
    if (res.ok) {
      const pokemon = await res.json()
      return {
        props: {
          pokemons: [{ name: pokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}` }],
          totalCount: 1,
          page: 1,
          filterName,
        },
      }
    } else {
      return {
        props: {
          pokemons: [],
          totalCount: 0,
          page: 1,
          filterName,
        },
      }
    }
  } else {
    const limit = 20
    const offset = (page - 1) * limit
    // Fetch data from external API
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
    const data: Props = await res.json()

    // Pass data to the page via props
    return {
      props: {
        pokemons: data.results,
        totalCount: data.count,
        page,
        filterName
      }
    }
  }
}