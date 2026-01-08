import { ListItemButtonProps } from '@mui/material/ListItemButton';

// ----------------------------------------------------------------------

export type NavItemProps = {
  title: string;
  titleKey?: string;
  path: string;
  icon?: React.ReactElement;
  children?: {
    subheader: string;
    subheaderKey?: string;
    items: {
      title: string;
      titleKey?: string;
      path: string;
    }[];
  }[];
};

export interface NavItemDesktopProps extends ListItemButtonProps {
  item: NavItemProps;
  offsetTop?: boolean;
  active?: boolean;
  open?: boolean;
  subItem?: boolean;
  externalLink?: boolean;
}

export interface NavItemMobileProps extends ListItemButtonProps {
  item: NavItemProps;
  active?: boolean;
  open?: boolean;
  externalLink?: boolean;
}

export type NavProps = {
  offsetTop: boolean;
  data: NavItemProps[];
};
