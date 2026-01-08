import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const onChangeLangMock = vi.fn();

vi.mock('src/locales/use-locales', () => ({
  default: () => ({
    allLangs: [
      { label: 'English', value: 'en', icon: 'flagpack:gb-nir' },
      { label: 'Srpski (latinica)', value: 'sr-Latn', icon: 'flagpack:rs' },
      { label: 'Srpski (cirilica)', value: 'sr-Cyrl', icon: 'flagpack:rs' },
    ],
    currentLang: { label: 'English', value: 'en', icon: 'flagpack:gb-nir' },
    onChangeLang: onChangeLangMock,
    t: (key: string) => key,
  }),
}));

import { LanguagePopover } from 'src/layouts/_common/language-popover';

describe('LanguagePopover', () => {
  beforeEach(() => {
    onChangeLangMock.mockClear();
  });

  it('calls onChangeLang when selecting a language', async () => {
    render(<LanguagePopover />);

    await userEvent.click(screen.getByLabelText(/language/i));
    await userEvent.click(await screen.findByRole('menuitem', { name: /srpski \\(latinica\\)/i }));

    expect(onChangeLangMock).toHaveBeenCalledWith('sr-Latn');
  });
});
