'use client'

// @mui
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import { m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
// components
import { MotionViewport, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const FEATURES = [
  {
    icon: '/assets/icons/home/ic_make_brand.svg',
    titleKey: 'landing.features.fieldReady.title',
    descriptionKey: 'landing.features.fieldReady.description',
  },
  {
    icon: '/assets/icons/home/ic_design.svg',
    titleKey: 'landing.features.accurateBilling.title',
    descriptionKey: 'landing.features.accurateBilling.description',
  },
  {
    icon: '/assets/icons/home/ic_development.svg',
    titleKey: 'landing.features.backOffice.title',
    descriptionKey: 'landing.features.backOffice.description',
  },
];

const STATS = [
  { labelKey: 'landing.stats.households', value: '100K+' },
  { labelKey: 'landing.stats.metersSynced', value: '250K' },
  { labelKey: 'landing.stats.monthlyReads', value: '1.2M' },
];

// ----------------------------------------------------------------------

export default function HomeMinimal() {
  const { t } = useTranslation();

  return (
    <Container
      component={MotionViewport}
      disableAnimatedMobile={false}
      sx={{
        py: { xs: 10, md: 15 },
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          p: { xs: 5, md: 8 },
          mb: { xs: 6, md: 10 },
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: (theme) =>
              `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 35%),
               radial-gradient(circle at 80% 0%, ${alpha(theme.palette.primary.light, 0.15)}, transparent 30%)`,
            pointerEvents: 'none',
          }}
        />
        <Stack spacing={3} sx={{ textAlign: { xs: 'left', md: 'center' }, position: 'relative' }}>
          <m.div variants={varFade().inUp} initial="initial" animate="animate">
            <Typography component="div" variant="overline" sx={{ color: 'text.disabled' }}>
              {t('landing.hero.overline')}
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown} initial="initial" animate="animate">
            <Typography variant="h2">
              {t('landing.hero.titleLine1')}
              <br /> {t('landing.hero.titleLine2')}
            </Typography>
          </m.div>

          <m.div variants={varFade().in} initial="initial" animate="animate">
            <Typography sx={{ color: 'text.secondary', maxWidth: 720, mx: { xs: 0, md: 'auto' } }}>
              {t('landing.hero.subtitle')}
            </Typography>
          </m.div>

          <m.div variants={varFade().inUp} initial="initial" animate="animate">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ md: 'center' }}>
              <Button size="large" variant="contained" href="/register">
                {t('landing.hero.primaryCta')}
              </Button>
              <Button size="large" variant="outlined" href="/dashboard">
                {t('landing.hero.secondaryCta')}
              </Button>
            </Stack>
          </m.div>
        </Stack>
      </Box>

      {/* Features */}
      <Box
        gap={{ xs: 3, lg: 10 }}
        display="grid"
        alignItems="center"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        sx={{ mb: { xs: 6, md: 10 } }}
      >
        {FEATURES.map((card, index) => (
          <m.div key={card.titleKey} variants={varFade().inUp} initial="initial" animate="animate">
            <Card
              sx={{
                textAlign: 'center',
                boxShadow: { md: 'none' },
                bgcolor: 'background.default',
                p: (theme) => theme.spacing(8, 5),
                ...(index === 1 && {
                  boxShadow: (theme) => ({
                    md: `-40px 40px 80px ${
                      theme.palette.mode === 'light'
                        ? alpha(theme.palette.grey[500], 0.16)
                        : alpha(theme.palette.common.black, 0.4)
                    }`,
                  }),
                }),
              }}
            >
              <Box
                component="img"
                src={card.icon}
                alt={t(card.titleKey)}
                sx={{ mx: 'auto', width: 48, height: 48 }}
              />

              <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
                {t(card.titleKey)}
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>{t(card.descriptionKey)}</Typography>
            </Card>
          </m.div>
        ))}
      </Box>

      {/* Stats */}
      <Box
        sx={{
          mb: { xs: 6, md: 10 },
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          borderRadius: 3,
          p: { xs: 4, md: 6 },
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 6 }}
          alignItems="center"
          justifyContent="space-between"
        >
          {STATS.map((stat) => (
            <m.div key={stat.labelKey} variants={varFade().inUp} initial="initial" animate="animate">
              <Stack spacing={0.5} sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                <Typography variant="h4">{stat.value}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{t(stat.labelKey)}</Typography>
              </Stack>
            </m.div>
          ))}
        </Stack>
      </Box>

      {/* CTA */}
      <Card
        sx={{
          textAlign: { xs: 'left', md: 'center' },
          p: { xs: 4, md: 6 },
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
          borderRadius: 3,
        }}
      >
        <m.div variants={varFade().inUp} initial="initial" animate="animate">
          <Typography variant="h4" sx={{ mb: 2 }}>
            {t('landing.cta.title')}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, maxWidth: 560, mx: { xs: 0, md: 'auto' } }}>
            {t('landing.cta.subtitle')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ md: 'center' }}>
            <Button size="large" variant="contained" href="/register">
              {t('landing.cta.primaryCta')}
            </Button>
            <Button size="large" variant="text" href="/auth/jwt/login">
              {t('landing.cta.secondaryCta')}
            </Button>
          </Stack>
        </m.div>
      </Card>
    </Container>
  );
}
