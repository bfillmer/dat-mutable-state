import React from 'react'
import shortid from 'shortid'
import { useFormState } from 'react-use-form-state'

// I. UTILITIES
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// II. ITEM
// Shape of the form data we want to maintain per item. If Josh had his way this would
// be TypeScript and a pretty data type. He's not wrong.
const initialItemState = {
  qty: ''
}

function ShowHideItem({children}) {
  const [toggle, setToggle] = React.useState(false)

  return (
    <li>
      <button type='button' onClick={() => setToggle(!toggle)}>{toggle ? 'Hide' : 'Show'}</button>
      {toggle && children}
    </li>
  )
}

function Item({ handleUpdate, id, itemsFormStateRef, resetKey, title}) {
  console.log(`Item ${id} Render`)
  const prevResetKey = React.useRef(resetKey)
  
  // Update our ref state on change.
  const [{values, reset}, { number }] = useFormState(itemsFormStateRef.current[id], {
    onChange: (e, stateValues, nextStateValues) => handleUpdate(id, nextStateValues)
  })

  // Do something with the individual value and ensure our ref state matches.
  function handleAdd (e) {
    console.log(`Handle Single Add`, values)
    reset()
    handleUpdate(id, initialItemState)
  }

  // Listen for a window event to reset our form state. This is only really relevant if
  // the form is actively rendered on the screen when the ref is cleared in the parent.
  React.useEffect(() => {
    // Failsafe in case somehow reset changes, which I don't think is possible but it's
    // not my library either.
    if (prevResetKey.current !== resetKey) {
      reset()
    }
    prevResetKey.current = resetKey
  }, [reset, resetKey])

  return (
    <form>
      <h4>{title}</h4>
      <input {...number('qty')} />
      <button type='button' onClick={handleAdd}>Add</button>
    </form>
  )
}

// III. PROVIDER
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

const ItemContext = React.createContext([])

function Provider({children}) {
  console.log(`Provider Render`)
  const [items, setItems] = React.useState([])
  const [resetKey, setResetKey] = React.useState(shortid.generate())
  const itemsFormStateRef = React.useRef({})

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

  // Display current overall form state at any point in time.
  function showRef() {
    console.log('Current Form State', itemsFormStateRef.current)
  }

  // Show the current overall form state, reset that state to defaults, and
  // trigger a reset event for any forms that might be open.
  function showAndReset() {
    showRef()
    resetFormStateRef(items)
    setResetKey(shortid.generate())
  }

  // Given an updated form state for an item we update that item in our ref.
  const updateFormStateRef = React.useCallback((id, state) => {
    itemsFormStateRef.current[id] = {
      ...itemsFormStateRef.current[id],
      ...state
    }
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
    <ItemContext.Provider value={{ items, itemsFormStateRef, resetKey, showAndReset, showRef, updateFormStateRef }}>
      {(items.length > 0) && children}
    </ItemContext.Provider>
  )
}

// IV. COMPOSITION
function List() {
  const { items, itemsFormStateRef, resetKey, showAndReset, showRef, updateFormStateRef} = React.useContext(ItemContext)

  return (
    <>
      <button onClick={showRef}>Show Ref State</button>
      <button onClick={showAndReset}>Show Ref and Reset</button>
      <ul>
        {items.map(i => (
          <ShowHideItem key={i.id}>
            {/* @NOTE Must pass in the whole ref in order to access initialState value for the form when mounted. */}
            <Item {...i} handleUpdate={updateFormStateRef} itemsFormStateRef={itemsFormStateRef} resetKey={resetKey} />
          </ShowHideItem>
        ))}
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
