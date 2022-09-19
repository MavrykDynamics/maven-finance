import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'
import { LoaderShineTextAnimation, LoaderStyled, LoaderStyledWithBackdrop } from './Loader.style'
import animationData from '../../ship-loop.json'
import Lottie from 'react-lottie'

const animation = JSON.parse(JSON.stringify(animationData))
const shipLoopOptions = {
  loop: true,
  autoplay: true,
  animationData: animation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

export const LoaderRocket = () => (
  <LoaderStyledWithBackdrop>
    <figure>
      <div>
        <Lottie width={250} height={200} options={shipLoopOptions} isClickToPauseDisabled={true} />
      </div>
      <figcaption>Loading...</figcaption>
    </figure>
  </LoaderStyledWithBackdrop>
)

export const LoaderWertIo = () => (
  <LoaderStyledWithBackdrop backdropAlpha={0.8}>
    <LoaderShineTextAnimation>Initializating Wert Io widget...</LoaderShineTextAnimation>
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

export const Loader = ({ loaderType }: { loaderType?: typeof ROCKET_LOADER | typeof WERT_IO_LOADER }) => {
  if (loaderType === ROCKET_LOADER) return <LoaderRocket />
  if (loaderType === WERT_IO_LOADER) return <LoaderWertIo />

  return <SpinnerLoader />
}

export default Loader
