import { memo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
// @mui
import { alpha, styled } from '@mui/material/styles';
// theme
import { bgBlur } from 'src/theme/css';

// ----------------------------------------------------------------------

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Chart = styled(ApexChart)(({ theme }) => ({
  '& .apexcharts-canvas': {
    // Tooltip
    '& .apexcharts-tooltip': {
      ...bgBlur({
        color: theme.palette.background.default,
      }),
      color: theme.palette.text.primary,
      boxShadow: theme.customShadows.dropdown,
      borderRadius: theme.shape.borderRadius * 1.25,
      '&.apexcharts-theme-light': {
        borderColor: 'transparent',
        ...bgBlur({
          color: theme.palette.background.default,
        }),
      },
    },
    '& .apexcharts-xaxistooltip': {
      ...bgBlur({
        color: theme.palette.background.default,
      }),
      borderColor: 'transparent',
      color: theme.palette.text.primary,
      boxShadow: theme.customShadows.dropdown,
      borderRadius: theme.shape.borderRadius * 1.25,
      '&:before': {
        borderBottomColor: alpha(theme.palette.grey[500], 0.24),
      },
      '&:after': {
        borderBottomColor: alpha(theme.palette.background.default, 0.8),
      },
    },
    '& .apexcharts-tooltip-title': {
      textAlign: 'center',
      fontWeight: theme.typography.fontWeightBold,
      backgroundColor: alpha(theme.palette.grey[500], 0.08),
      color: theme.palette.text[theme.palette.mode === 'light' ? 'secondary' : 'primary'],
    },

    // LEGEND
    '& .apexcharts-legend': {
      padding: 0,
    },
    '& .apexcharts-legend-series': {
      display: 'inline-flex !important',
      alignItems: 'center',
    },
    '& .apexcharts-legend-marker': {
      marginRight: 8,
    },
    '& .apexcharts-legend-text': {
      lineHeight: '18px',
      textTransform: 'capitalize',
    },
  },
}));

export type ChartWrapperProps = {
  type?: ApexOptions['chart']['type'];
  series: ApexOptions['series'];
  options: ApexOptions;
  height?: number | string;
  width?: number | string;
};

export function ChartWrapper({
  type = 'line',
  series,
  options,
  height = 320,
  width,
}: ChartWrapperProps) {
  return <Chart type={type} series={series} options={options} height={height} width={width} />;
}

export default memo(Chart);
