import type { ButtonProps } from './Button.controller'

import { Button } from './Button.controller'

type Props = ButtonProps

export const ButtonCircle = (props: Props) => {
  return <Button className="button-circle" {...props} />
}
