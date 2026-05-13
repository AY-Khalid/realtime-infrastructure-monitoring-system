/**
 * Centralised ECharts registration. We tree-shake the parts we actually use
 * so the final bundle stays lean (≈ 35% smaller vs. the full build).
 */

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  LineChart,
  BarChart,
  HeatmapChart,
  RadarChart,
  CustomChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from 'echarts/components';

let installed = false;

export function installECharts(): void {
  if (installed) return;
  use([
    CanvasRenderer,
    LineChart,
    BarChart,
    HeatmapChart,
    RadarChart,
    CustomChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    DataZoomComponent,
    VisualMapComponent,
    MarkLineComponent,
    MarkAreaComponent,
  ]);
  installed = true;
}
