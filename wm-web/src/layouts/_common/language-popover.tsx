'use client';

import { useCallback } from 'react';
// @mui
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
// components
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
// locales
import useLocales from 'src/locales/use-locales';

export function LanguagePopover() {
  const popover = usePopover();
  const { allLangs, currentLang, onChangeLang } = useLocales();

  const handleChange = useCallback(
    (value: string) => {
      onChangeLang(value);
      popover.onClose();
    },
    [onChangeLang, popover]
  );

  return (
    <>
      <IconButton onClick={popover.onOpen} aria-label="language" sx={{ width: 40, height: 40 }}>
        <Iconify icon={currentLang.icon} width={22} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right" sx={{ width: 200 }}>
        <MenuList sx={{ p: 0.5 }}>
          {allLangs.map((lang) => (
            <MenuItem
              key={lang.value}
              selected={lang.value === currentLang.value}
              onClick={() => handleChange(lang.value)}
            >
              <Iconify icon={lang.icon} width={20} />
              {lang.label}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </>
  );
}

