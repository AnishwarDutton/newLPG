import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Skeleton } from '@mui/material';

export default function KpiCard({ title, value, subtitle, icon, color = '#F59E0B', loading }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" fontWeight={600}>
              {title}
            </Typography>
            {loading
              ? <Skeleton width={80} height={48} sx={{ mt: 0.5 }} />
              : <Typography variant="h4" fontWeight={800} fontFamily="Syne, sans-serif" sx={{ mt: 0.5, lineHeight: 1.1 }}>
                  {value}
                </Typography>
            }
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color, flexShrink: 0,
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
