import PokemonTable from "@/components/PokemonTable"
import { InferGetServerSidePropsType } from "next"
import {useRouter} from "next/router"

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

export default function Page({ pokemons, totalCount, page, }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()

  function goToPage(newPage: number) {
    router.push(`/?page=${newPage}`)
  }
  // Render data...
  return (
    <div className="p-5">
      <h1>Pokédex</h1>
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
    </div>
  )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const page: number = Number(context.query.page) || 1
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
    }
  }
}