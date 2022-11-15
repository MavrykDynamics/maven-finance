export const sortByCategory = <T extends { category: string | null }>(data: T[], category: string) => {
  const dataToSort = data ? [...data] : []
  dataToSort.sort((a, b) => {
    // sort by category
    if (!a.category) return 1

    if (a.category === category && b.category === category) {
      return 0
    }

    if (a.category === category) {
      return -1
    }

    // sort by alfabet
    if (!b.category) return -1

    if (a.category < b.category) {
      return -1
    }

    if (a.category > b.category) {
      return 1
    }

    return 1
  })

  return dataToSort
}
