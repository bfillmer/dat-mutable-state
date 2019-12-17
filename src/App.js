import React from 'react'
import { useFormState } from 'react-use-form-state'

// UTILITIES
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

// Simulate API call for data.
async function getItems(setItems) {
  await timeout(500)
  const items = [
    { id: 101, title: 'Calc I' },
    { id: 201, title: 'Calc II' },
    { id: 301, title: 'Calc III' }
  ]

  setItems(items)
  return items
}

const ItemContext = React.createContext([])

function Provider({children}) {
  console.log(`Provider Render`)
  const [items, setItems] = React.useState([])
  const itemsFormStateRef = React.useRef({})

  function showRef () {
    console.log('Current Form State', itemsFormStateRef.current)
  }

  // Setup our formStateRef based on new item data.
  const resetFormStateRef = React.useCallback((newItems) => {
    itemsFormStateRef.current = {}
    if (newItems.length > 0) {
      newItems.forEach(i => {
        itemsFormStateRef.current = {
          ...itemsFormStateRef.current,
          [i.id]: initialItemState
        }
      })
    }
  }, [])

  // Would need to rerun processItems when pagination changes the items.
  React.useEffect(() => {
    async function processItems() {
      const items = await getItems(setItems)
      resetFormStateRef(items)
    }

    processItems()
  }, [resetFormStateRef])
  
  return (
    <ItemContext.Provider value={{items, showRef}}>
      {(items.length > 0) && children}
    </ItemContext.Provider>
  )
}

function List() {
  const {items, showRef} = React.useContext(ItemContext)

  return (
    <>
      <button onClick={showRef}>Show Ref State</button>
      <ul>
        {items.map(i => <Item {...i} key={i.id} />)}
      </ul>
    </>
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
