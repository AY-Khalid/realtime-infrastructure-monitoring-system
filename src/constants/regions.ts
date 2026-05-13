import type { Region } from '@/types';

export interface RegionMeta {
  key: Region;
  label: string;
  short: string;
  baseLoad: number;
  jitter: number;
}

export const REGIONS: RegionMeta[] = [
  { key: 'us-east', label: 'US East (N. Virginia)', short: 'USE1', baseLoad: 58, jitter: 14 },
  { key: 'us-west', label: 'US West (Oregon)', short: 'USW2', baseLoad: 49, jitter: 12 },
  { key: 'eu-west', label: 'EU West (Ireland)', short: 'EUW1', baseLoad: 54, jitter: 13 },
  { key: 'eu-central', label: 'EU Central (Frankfurt)', short: 'EUC1', baseLoad: 51, jitter: 11 },
  { key: 'ap-south', label: 'AP South (Mumbai)', short: 'APS1', baseLoad: 62, jitter: 15 },
  { key: 'ap-northeast', label: 'AP Northeast (Tokyo)', short: 'APN1', baseLoad: 47, jitter: 13 },
  { key: 'sa-east', label: 'SA East (São Paulo)', short: 'SAE1', baseLoad: 44, jitter: 10 },
];

export const REGION_KEYS: Region[] = REGIONS.map((r) => r.key);

export function getRegion(key: Region): RegionMeta {
  return REGIONS.find((r) => r.key === key) ?? REGIONS[0];
}
