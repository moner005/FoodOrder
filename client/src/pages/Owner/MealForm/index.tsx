import { useParams } from 'react-router-dom'

export default function MealForm() {
  const { id } = useParams()

  return (
    <div>
      <h1>{id === undefined ? 'Add meal' : `Edit meal ${id}`}</h1>
    </div>
  )
}
