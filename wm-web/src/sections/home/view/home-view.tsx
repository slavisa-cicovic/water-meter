'use client';

import { useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { Box } from '@mui/material';
import MainLayout from 'src/layouts/main';
import ScrollProgress from 'src/components/scroll-progress';
import HomeMinimal from '../home-minimal';
import { useAuthContext } from 'src/auth/hooks';
import useLocales from 'src/locales/use-locales';


const normalizeLocale = (value?: string | null) => (value === 'sr' ? 'sr-Latn' : value);

export default function HomeView() {
  const { scrollYProgress } = useScroll();
  const { user } = useAuthContext();
  const { onChangeLang, currentLang } = useLocales();

  useEffect(() => {
    const preferredLocale = normalizeLocale(user?.locale);
    if (preferredLocale && preferredLocale !== currentLang.value) {
      onChangeLang(preferredLocale);
      return;
    }

    if (!user && currentLang.value !== 'en') {
      onChangeLang('en');
    }
  }, [currentLang.value, onChangeLang, user, user?.locale]);

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />
      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        <HomeMinimal />
      </Box>
    </MainLayout>
  );
}
