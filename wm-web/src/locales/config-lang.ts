'use client';

import merge from 'lodash/merge';
import { enUS as enUSAdapter, sr as srCyrlAdapter, srLatn as srLatnAdapter } from 'date-fns/locale';
// core
import { enUS as enUSCore, srRS as srRSCore } from '@mui/material/locale';
// date-pickers
import { enUS as enUSDate } from '@mui/x-date-pickers/locales';
// data-grid
import { enUS as enUSDataGrid } from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------
export const allLangs = [
  {
    label: 'English',
    value: 'en',
    systemValue: merge(enUSDate, enUSDataGrid, enUSCore),
    adapterLocale: enUSAdapter,
    icon: 'flagpack:gb-nir',
  },
  {
    label: 'Srpski (latinica)',
    value: 'sr-Latn',
    systemValue: merge(enUSDate, enUSDataGrid, srRSCore),
    adapterLocale: srLatnAdapter,
    icon: 'flagpack:rs',
  },
  {
    label: 'Srpski (cirilica)',
    value: 'sr-Cyrl',
    systemValue: merge(enUSDate, enUSDataGrid, srRSCore),
    adapterLocale: srCyrlAdapter,
    icon: 'flagpack:rs',
  },
];

export const defaultLang = allLangs[0]; // English
