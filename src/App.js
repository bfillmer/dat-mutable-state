import React from 'react'
import { useFormState } from 'react-use-form-state'

// ITEM
const initialItemState = {
  qty: ''
}

function Item({id, title}) {
  console.log(`Item ${id} Render`)
  const [formState, { text }] = useFormState(initialItemState)

  return (
    <li>
      <form>
        <h4>{title}</h4>
        <input {...text('qty')} />
      </form>
    </li>
  )
}

// PROVIDER
const items = [
  { id: 101, title: 'Calc I' },
  { id: 201, title: 'Calc II' },
  { id: 301, title: 'Calc III' }
]

const ItemContext = React.createContext([])

function Provider({children}) {
  return (
    <ItemContext.Provider value={items}>
      {children}
    </ItemContext.Provider>
  )
}

function List() {
  const items = React.useContext(ItemContext)
  
  return (
    <ul>
      {items.map(i => <Item {...i} key={i.id} />)}
    </ul>
  )
}

// COMPOSITION
function App() {
  return (
    <Provider>
      <h1>Mutable State Provider &amp; Children</h1>
      <List />
    </Provider>
  )
}

export default App
