// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
// theme
import { primaryPresets } from 'src/theme/options/presets';

// ----------------------------------------------------------------------

type PresetsOptionsProps = {
  value: string;
  onChange: (newValue: string) => void;
};

export default function PresetsOptions({ value, onChange }: PresetsOptionsProps) {
  const options = primaryPresets.map((color) => ({
    name: color.name,
    value: color.main,
  }));

  return (
    <Box columnGap={2} rowGap={1.5} display="grid" gridTemplateColumns="repeat(3, 1fr)">
      {options.map((option) => {
        const selected = value === option.name;

        return (
          <ButtonBase
            key={option.name}
            onClick={() => onChange(option.name)}
            sx={{
              height: 56,
              borderRadius: 1,
              border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
              ...(selected && {
                borderColor: 'transparent',
                bgcolor: alpha(option.value, 0.08),
              }),
            }}
          >
            <Box
              component="svg"
              width={24}
              height={16}
              viewBox="0 0 24 16"
              sx={{
                borderRadius: 0.5,
                bgcolor: (theme) => selected ? `${alpha(theme.palette.primary.main, 0.2)}` : 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: (theme) =>
                  theme.transitions.create(['transform', 'box-shadow'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                ...(selected && {
                  transform: 'scale(1.05)',
                  boxShadow: (theme) => theme.shadows[3],
                }),
              }}
            >
              <rect x="1" y="1" width="5" height="14" rx="2" fill={option.value} />
              <rect x="8" y="2" width="14" height="2" rx="1" fill="#e0e0e0" />
              <rect x="8" y="7" width="14" height="3" rx="1" fill="#bdbdbd" />
              <rect x="8" y="12" width="14" height="2" rx="1" fill="#e0e0e0" />
            </Box>

          </ButtonBase>
        );
      })}
    </Box>
  );
}
