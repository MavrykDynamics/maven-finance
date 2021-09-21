import { Button } from 'app/App.components/Button/Button.controller'
import * as React from 'react'
import { Link } from 'react-router-dom'

//prettier-ignore
import { HomeButtons, HomeStyled, HomeTitle } from './Home.style'

export const HomeView = () => {
  return (
    <HomeStyled>
      <HomeTitle>The cooperative art market</HomeTitle>
      <video width="950" autoPlay muted loop>
        <source src="videos/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <HomeButtons>
        <Link to="/create">
          <Button color="primary" text="Create new canvas" icon="tiles" />
        </Link>
        <Link to="/marketplace">
          <Button color="primary" text="Contribute to existing canvas" icon="tiles-edit" />
        </Link>
      </HomeButtons>
    </HomeStyled>
  )
}
