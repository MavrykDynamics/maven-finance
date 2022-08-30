export const getItemFromStorage = (item: string) => {
  const itemFromStorage = localStorage.getItem(item)
  return itemFromStorage ? JSON.parse(itemFromStorage) : null
}

export const setItemInStorage = (item: string, value: any) => {
  localStorage.setItem(item, JSON.stringify(value))

  return getItemFromStorage(item)
}

export const removeItemFromStorage = (item: string) => {
  localStorage.removeItem(item)
}

export const updateItemInStorage = (item: string, updateValue: object) => {
  const itemFromStorage = getItemFromStorage(item)
  const updatedItem = {
    ...itemFromStorage,
    ...updateValue,
  }
  return setItemInStorage(item, updatedItem)
}
