import EyeIcon from '@/icons/eye.svg';
import BadgeIcon from '@/icons/badge.svg';
import BookIcon from '@/icons/book.svg';

import { Status } from '~/types';
import React from 'react';

type StatusIconProps = React.SVGProps<SVGElement> & {
  [key: `data-${string}`]: string;
}

const renderStatusIcon = (status: string, props?: StatusIconProps) => {
  const iconProps: StatusIconProps = {
    width: 20,
    height: 20,
    ...props,
  };

  switch(status) {
    case Status.In_Progress.toString():
      return <EyeIcon {...iconProps} />
    case Status.Finished.toString():
      return <BadgeIcon {...iconProps} />
    default:
      return <BookIcon {...iconProps} />
  }
}

export default renderStatusIcon;