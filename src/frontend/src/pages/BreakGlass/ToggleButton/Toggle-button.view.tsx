import * as React from 'react';

import { ToggleButtonWrapper, ToggleButtonItem } from './Toggle-button.style';

type ToggleButtonViewProps = {
  toggleData: Array<{
    buttonName: string;
    buttonId: string;
  }>;
};

export const ToggleButton = ({ toggleData }: ToggleButtonViewProps) => {
  const [selectedToogler, setSelectedToggler] = React.useState<null | string>(null);
  console.log('selectedToogler', selectedToogler);

  return (
    <ToggleButtonWrapper>
      {toggleData.map(({ buttonName, buttonId }) => (
        <ToggleButtonItem
          className={selectedToogler === buttonId ? 'selected' : ''}
          onClick={() => setSelectedToggler(buttonId)}
        >
          {buttonName}
        </ToggleButtonItem>
      ))}
    </ToggleButtonWrapper>
  );
};
