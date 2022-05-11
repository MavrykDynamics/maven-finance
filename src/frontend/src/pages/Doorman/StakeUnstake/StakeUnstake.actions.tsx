import { showToaster } from '../../../app/App.components/Toaster/Toaster.actions'
import { INFO } from '../../../app/App.components/Toaster/Toaster.constants'

export const rewardsCompound = () => (dispatch: any) => {
  dispatch(showToaster(INFO, 'Compound', 'Coming Soon', 3000))
}
