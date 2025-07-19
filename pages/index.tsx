import PokemonTable from "@/components/PokemonTable"
import { InferGetServerSidePropsType } from "next"

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

export default function Page({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log(data)
  // Render data...
  return (
    <div className="p-5">
      <h1>Pokédex</h1>

      <PokemonTable data={data.results} />
    </div>


  )
}

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=20`)
  const data: Props = await res.json()

  // Pass data to the page via props
  return { props: { data } }
}