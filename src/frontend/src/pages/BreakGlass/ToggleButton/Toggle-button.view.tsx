import * as React from 'react';

import { ToggleButtonWrapper, ToggleButtonItem } from './Toggle-button.style';

type ToggleButtonViewProps = {
  toggleData: Array<{
    buttonName: string;
    buttonId: string;
  }>;
};

export const ToggleButton = ({ toggleData }: ToggleButtonViewProps) => {
  const [selectedToogler, setSelectedToggler] = React.useState<null | string>(
    toggleData[0].buttonId,
  );

  return (
    <ToggleButtonWrapper
      className={`${toggleData.length <= 2 ? 'small-size' : ''} ${
        toggleData.length > 4 ? 'big-size' : ''
      }`}
    >
      {toggleData.map(({ buttonName, buttonId }) => (
        <ToggleButtonItem
          className={`${selectedToogler === buttonId ? 'selected' : ''} toggle-btn`}
          onClick={() => setSelectedToggler(buttonId)}
        >
          {buttonName}
        </ToggleButtonItem>
      ))}
    </ToggleButtonWrapper>
  );
};
