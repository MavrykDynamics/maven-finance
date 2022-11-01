export const scrollUpPage = () => {
  const isActiveScroll = document.body.scrollHeight !== window.innerHeight

  if (isActiveScroll) {
    window.scrollTo(0, 0)
  }
}
