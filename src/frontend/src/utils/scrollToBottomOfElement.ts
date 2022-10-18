export const scrollToBottomOfElement = (element: HTMLElement | null) => {
  if (!element) return

  element.scrollIntoView({ block: "start", inline: "nearest", behavior: "smooth"})
}
