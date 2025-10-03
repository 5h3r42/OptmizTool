
import type { Preset } from './types';

export const PRESETS: Preset[] = [
    {
        id: 'product-zoom',
        name: 'Product Zoom',
        description: '1200×1200 px for detail views',
        width: 1200,
        height: 1200,
        quality: 0.82,
        targetSizeKB: 150,
    },
    {
        id: 'product-catalog',
        name: 'Product Catalog/Shop',
        description: '800×800 px for main listings',
        width: 800,
        height: 800,
        quality: 0.82,
        targetSizeKB: 100,
    },
    {
        id: 'product-thumbnail',
        name: 'Thumbnails (Cart/Widgets)',
        description: '300×300 px for smaller previews',
        width: 300,
        height: 300,
        quality: 0.80,
        targetSizeKB: 50,
    },
    {
        id: 'hero-banner',
        name: 'Hero/Banners',
        description: '1920×1080 px for wide banners',
        width: 1920,
        height: 1080,
        quality: 0.85,
        targetSizeKB: 300,
    }
];