import merge from 'lodash/merge';
import { Theme } from '@mui/material/styles';
//
import { defaultProps } from './default-props';
//
import { card } from './components/card';
import { chip } from './components/chip';
import { tabs } from './components/tabs';
import { menu } from './components/menu';
import { list } from './components/list';
import { table } from './components/table';
import { alert } from './components/alert';
import { badge } from './components/badge';
import { radio } from './components/radio';
import { appBar } from './components/appbar';
import { drawer } from './components/drawer';
import { dialog } from './components/dialog';
import { button } from './components/button';
import { select } from './components/select';
import { switches } from './components/switch';
import { tooltip } from './components/tooltip';
import { popover } from './components/popover';
import { stepper } from './components/stepper';
import { svgIcon } from './components/svg-icon';
import { skeleton } from './components/skeleton';
import { checkbox } from './components/checkbox';
import { dataGrid } from './components/data-grid';
import { textField } from './components/textfield';
import { accordion } from './components/accordion';
import { typography } from './components/typography';
import { pagination } from './components/pagination';
import { datePicker } from './components/date-picker';
import { cssBaseline } from './components/css-baseline';
import { buttonGroup } from './components/button-group';
import { autocomplete } from './components/autocomplete';
import { loadingButton } from './components/loading-button';

// ----------------------------------------------------------------------

export function componentsOverrides(theme: Theme) {
  const components = merge(
    defaultProps(theme),
    //
    tabs(theme),
    chip(theme),
    card(theme),
    menu(theme),
    list(theme),
    badge(theme),
    table(theme),
    alert(theme),
    radio(theme),
    select(theme),
    button(theme),
    dialog(theme),
    appBar(theme),
    drawer(theme),
    stepper(theme),
    tooltip(theme),
    popover(theme),
    svgIcon(theme),
    switches(theme),
    checkbox(theme),
    dataGrid(theme),
    skeleton(theme),
    textField(theme),
    accordion(theme),
    typography(theme),
    pagination(theme),
    datePicker(theme),
    buttonGroup(theme),
    cssBaseline(theme),
    autocomplete(theme),
    loadingButton(theme)
  );

  return components;
}
