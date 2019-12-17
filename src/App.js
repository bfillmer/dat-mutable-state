import React from 'react'
import { useFormState } from 'react-use-form-state'

// UTILITIES
// Create an event listener pattern to use to forcibly reset form states for
// children that won't be re-rendered when we want to reset our overall formState.
const RESET_EVENT = 'form-reset-event'

function resetEvent() {
  window.dispatchEvent(
    new CustomEvent(RESET_EVENT)
  )
}

function listen(listener) {
  window.addEventListener(RESET_EVENT, listener, false)
  return () => window.removeEventListener(RESET_EVENT, listener)
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Shape of the form data we want to maintain per item. If Josh had his way this would
// be TypeScript and a pretty data type. He's not wrong.
const initialItemState = {
  qty: ''
}

// ITEM
function ShowHideItem({children}) {
  const [toggle, setToggle] = React.useState(false)

  return (
    <li>
      <button type='button' onClick={() => setToggle(!toggle)}>{toggle ? 'Hide' : 'Show'}</button>
      {toggle && children}
    </li>
  )
}

function Item({ handleUpdate, id, itemsFormStateRef, title}) {
  console.log(`Item ${id} Render`)
  
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
    return listen(reset)
  }, [reset])

  return (
    <form>
      <h4>{title}</h4>
      <input {...number('qty')} />
      <button type='button' onClick={handleAdd}>Add</button>
    </form>
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

const ItemContext = React.createContext([])

function Provider({children}) {
  console.log(`Provider Render`)
  const [items, setItems] = React.useState([])
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
    resetEvent()
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
    <ItemContext.Provider value={{ items, itemsFormStateRef, showAndReset, showRef, updateFormStateRef }}>
      {(items.length > 0) && children}
    </ItemContext.Provider>
  )
}

// COMPOSITION
function List() {
  const { items, itemsFormStateRef, showAndReset, showRef, updateFormStateRef} = React.useContext(ItemContext)

  return (
    <>
      <button onClick={showRef}>Show Ref State</button>
      <button onClick={showAndReset}>Show Ref and Reset</button>
      <ul>
        {items.map(i => (
          <ShowHideItem key={i.id}>
            {/* @NOTE Must pass in the whole ref in order to access initialState value for the form when mounted. */}
            <Item {...i} handleUpdate={updateFormStateRef} itemsFormStateRef={itemsFormStateRef} />
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
