import PencilIcon from '@/icons/pencil.svg';
import SaveIcon from '@/icons/save.svg';
import React from 'react';

type EditButtonProps = {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
  callback(): void;
  iconSize?: {
    width: number;
    height: number;
  };
  className?: string;
}

const EditButton = ({
  isEditing,
  setIsEditing,
  callback,
  iconSize = {
    width: 20,
    height: 20,
  },
  className,
  ...props
}: EditButtonProps) => {
  const iconPadding = 10;
  const buttonWidth = iconSize.width + iconPadding;
  const buttonHeight = iconSize.height + iconPadding;

  return (
    <button {...props} type="button" className={className} style={{ width: buttonWidth, height: buttonHeight }} onClick={() => {
      if (isEditing) {
        callback();
        setIsEditing(false);
      } else {
        setIsEditing(true)
      }
    }}>
      {isEditing ? (
        <SaveIcon width={iconSize.width} height={iconSize.height} />
      ) : (
        <PencilIcon width={iconSize.width} height={iconSize.height} />
      )}
    </button>
  )
}

export default EditButton;