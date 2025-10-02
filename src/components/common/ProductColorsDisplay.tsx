import React from 'react';
import { Box, Chip, Typography, Grid } from '@mui/material';
import { ColorLens as ColorLensIcon } from '@mui/icons-material';

interface ProductColorsDisplayProps {
  colors: string[][];
  title?: string;
  showTitle?: boolean;
}

const ProductColorsDisplay: React.FC<ProductColorsDisplayProps> = ({
  colors = [],
  title = 'ألوان المنتج',
  showTitle = true
}) => {
  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <Box>
      {showTitle && (
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ColorLensIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}
      
      <Grid container spacing={2}>
        {colors.map((colorGroup, groupIndex) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={groupIndex}>
            <Box
              border={1}
              borderColor="divider"
              borderRadius={1}
              p={2}
              bgcolor="background.paper"
            >
              <Typography variant="subtitle2" mb={1} color="text.secondary">
                مجموعة {groupIndex + 1}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {colorGroup.map((color, colorIndex) => (
                  <Chip
                    key={colorIndex}
                    label={color}
                    size="small"
                    style={{
                      backgroundColor: color,
                      color: color.startsWith('#') ? 
                        (parseInt(color.slice(1), 16) > 0xffffff / 2 ? '#000' : '#fff') : '#000',
                      border: '1px solid #ddd'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductColorsDisplay; 