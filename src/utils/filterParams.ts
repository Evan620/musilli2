// Utility for consistent URL param parsing and filter normalization
// Used by Rentals, Land, Commercial pages

import { CommercialSearchFilters, PropertySearchFilters } from "@/types";

// Parse comma-separated values to array
export function parseCSVParam(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const arr = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return arr.length ? arr : undefined;
}

// Safe number parsing
export function parseNumberParam(raw: string | null): number | undefined {
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

// Normalize property type from various inputs
export function normalizePropertyType(raw?: string | null): PropertySearchFilters['type'] | undefined {
  if (!raw) return undefined;
  const v = raw.toLowerCase();
  const allowed = ['house', 'apartment', 'land', 'commercial', 'airbnb'] as const;
  return (allowed as readonly string[]).includes(v) ? (v as PropertySearchFilters['type']) : undefined;
}

// Build PropertySearchFilters from URLSearchParams
export function paramsToPropertyFilters(params: URLSearchParams): PropertySearchFilters {
  const city = params.get('city') || params.get('location') || undefined;
  const query = params.get('query') || params.get('keywords') || '';
  const type = normalizePropertyType(params.get('type') || params.get('propertyType'));

  const minPrice = parseNumberParam(params.get('minPrice') || params.get('priceMin'));
  const maxPrice = parseNumberParam(params.get('maxPrice') || params.get('priceMax'));
  const bedrooms = parseNumberParam(params.get('bedrooms')) as any;
  const bathrooms = parseNumberParam(params.get('bathrooms')) as any;
  const minArea = parseNumberParam(params.get('minArea') || params.get('lotSize'));
  const maxArea = parseNumberParam(params.get('maxArea'));
  const amenities = parseCSVParam(params.get('amenities'));

  return {
    query,
    category: (params.get('category') as any) || undefined,
    type,
    city,
    providerId: params.get('provider') || undefined,
    sortBy: (params.get('sortBy') as any) || 'date',
    sortOrder: (params.get('sortOrder') as any) || 'desc',
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    amenities,
  };
}

// Build CommercialSearchFilters from URLSearchParams
export function paramsToCommercialFilters(params: URLSearchParams): CommercialSearchFilters {
  const requiredAmenities = parseCSVParam(params.get('requiredAmenities'));
  const minSize = parseNumberParam(params.get('minSize'));
  const maxSize = parseNumberParam(params.get('maxSize'));
  const minRent = parseNumberParam(params.get('minRent'));
  const maxRent = parseNumberParam(params.get('maxRent'));
  const minParking = parseNumberParam(params.get('minParking'));

  return {
    query: params.get('query') || params.get('keywords') || undefined,
    commercialType: (params.get('commercialType') as any) || undefined,
    buildingClass: (params.get('buildingClass') as any) || undefined,
    zoning: (params.get('zoning') as any) || undefined,
    leaseType: (params.get('leaseType') as any) || undefined,
    sortBy: (params.get('sortBy') as any) || 'date',
    sortOrder: (params.get('sortOrder') as any) || 'desc',
    minSize,
    maxSize,
    minRent,
    maxRent,
    minParking,
    requiredAmenities,
  };
}