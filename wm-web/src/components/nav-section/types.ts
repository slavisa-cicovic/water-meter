import { StackProps } from '@mui/material/Stack';
import { ListItemButtonProps } from '@mui/material/ListItemButton';

// ----------------------------------------------------------------------

export type NavConfigProps = {
  hiddenLabel?: boolean;
  itemGap?: number;
  iconSize?: number;
  itemRadius?: number;
  itemPadding?: string;
  currentRole?: string;
  currentPermissions?: string[];
  itemSubHeight?: number;
  itemRootHeight?: number;
};

export type NavItemProps = ListItemButtonProps & {
  item: NavListProps;
  depth: number;
  open?: boolean;
  active: boolean;
  externalLink?: boolean;
};

export type NavListProps = {
  title: string;
  titleKey?: string;
  path: string;
  icon?: React.ReactElement;
  info?: React.ReactElement;
  caption?: string;
  captionKey?: string;
  disabled?: boolean;
  roles?: string[];
  permissions?: string[];
  children?: any;
};

export type NavSectionProps = StackProps & {
  data: {
    subheader: string;
    subheaderKey?: string;
    items: NavListProps[];
  }[];
  config?: NavConfigProps;
};
