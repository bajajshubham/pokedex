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
  return(
    <div>
      <h1>
        Helloooooo
      </h1>
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