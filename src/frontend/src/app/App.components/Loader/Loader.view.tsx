import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'
import { LoaderShineTextAnimation, LoaderStyled, LoaderStyledWithBackdrop } from './Loader.style'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

export const LoaderRocket = () => (
  <LoaderStyledWithBackdrop>
    <figure>
      <div>
        <img src="icons/lottie_rocket.gif" />
      </div>
    </figure>
  </LoaderStyledWithBackdrop>
)

export const LoaderWertIo = () => (
  <LoaderStyledWithBackdrop backdropAlpha={0.8}>
    <LoaderShineTextAnimation>Initializating Wert IO widget...</LoaderShineTextAnimation>
  </LoaderStyledWithBackdrop>
)

export const SpinnerLoader = () => (
  <LoaderStyled>
    <div className="loading">
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
    </div>
  </LoaderStyled>
)

export const Loader = () => {
  const { loading: loaderType } = useSelector((state: State) => state)

  switch (loaderType) {
    case ROCKET_LOADER:
      return <LoaderRocket />
    case WERT_IO_LOADER:
      return <LoaderWertIo />
    default:
      return null
  }
}

export default Loader
