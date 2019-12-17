import React from 'react'
import { useFormState } from 'react-use-form-state'

// UTILITIES
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ITEM
function Item({handleUpdate, id, initialState, title}) {
  console.log(`Item ${id} Render`)

  const [formState, { number }] = useFormState(initialState, {
    onChange: (e, stateValues, nextStateValues) => handleUpdate(id, nextStateValues)
  })

  return (
    <li>
      <form>
        <h4>{title}</h4>
        <input {...number('qty')} />
        <button type='button' onClick={() => console.log(`Handle Single Add`, formState)}>Add</button>
      </form>
    </li>
  )
}

// PROVIDER

// Simulate API call for data.
async function getItems() {
  await timeout(500)
  const items = [
    { id: 101, title: 'Calc I' },
    { id: 201, title: 'Calc II' },
    { id: 301, title: 'Calc III' }
  ]

  return items
}

// Shape of the form data we want to maintain per item. If Josh had his way this would
// be TypeScript and a pretty data type. He's not wrong.
const initialItemState = {
  qty: ''
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

  // Given an updated form state for an item we update that item in our ref.
  const updateFormStateRef = React.useCallback((id, state) => {
    itemsFormStateRef.current[id] = state
  }, [])

  // Would need to rerun processItems when pagination changes the items.
  React.useEffect(() => {
    async function processItems() {
      const items = await getItems()
      resetFormStateRef(items)
      setItems(items)
    }

    processItems()
  }, [resetFormStateRef])
  
  return (
    <ItemContext.Provider value={{ items, itemsFormStateRef, showRef, updateFormStateRef }}>
      {(items.length > 0) && children}
    </ItemContext.Provider>
  )
}

// COMPOSITION
function List() {
  const { items, itemsFormStateRef, showRef, updateFormStateRef} = React.useContext(ItemContext)

  return (
    <>
      <button onClick={showRef}>Show Ref State</button>
      <ul>
        {items.map(i => <Item {...i} key={i.id} handleUpdate={updateFormStateRef} initialState={itemsFormStateRef.current[i.id]} />)}
      </ul>
    </>
  )
}

function App() {
  return (
    <Provider>
      <h1>Mutable State Provider &amp; Children</h1>
      <List />
    </Provider>
  )
}

export default App
