'use client';

import { useState } from 'react';

import { formatCurrency } from '@/lib/utils';
import type { CatalogQueryParams } from '@/modules/products/repository/types';
import type { CatalogFilters } from '@/modules/products/types/catalog';
import type { ActiveFilter, FilterKey } from '@/modules/products/utils/catalog-filters';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/shadcn-ui/accordion';
import { Slider } from '@/shared/components/shadcn-ui/slider';
import { FilterGroup } from './FilterGroup';

interface CatalogSidebarProps {
  filters: CatalogFilters;
  currentParams: CatalogQueryParams;
  activeFilters: ActiveFilter[];
  onToggleList: (key: FilterKey, value: string) => void;
  onToggleCategory: (value: string) => void;
  onApplyPrice: (min?: number, max?: number) => void;
  onRemoveFilter: (filter: ActiveFilter) => void;
  onClearAll: () => void;
}

const TRIGGER_CLASS = 'font-brand-elephant items-center text-lg text-gray-800 hover:no-underline';
const CONTENT_CLASS = '';

export function CatalogSidebar({
  filters,
  currentParams,
  activeFilters,
  onToggleList,
  onToggleCategory,
  onApplyPrice,
  onRemoveFilter,
  onClearAll,
}: CatalogSidebarProps) {
  const [priceMinInput, setPriceMinInput] = useState(currentParams.priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(currentParams.priceMax);

  // Solo categorías raíz como checkboxes; las subcategorías se navegan por breadcrumb.
  const categoryOptions = filters.categories;

  const defaultOpenValues = [
    ...(categoryOptions.length > 0 ? ['categories'] : []),
    ...(filters.flavors.length > 0 ? ['flavors'] : []),
    ...(filters.attributions.length > 0 ? ['attributions'] : []),
    ...filters.attributes.map((attribute) => `attribute-${attribute.id}`),
    'price',
  ];

  return (
    <aside className="space-y-4">
      <div className="rounded-xs border border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">Filtros</p>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-gray-500 underline-offset-4 hover:text-gray-800 hover:underline"
          >
            Limpiar Filtros
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-6 space-y-2 rounded-sm bg-gray-50 p-3">
            <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">
              Filtros Seleccionados
            </p>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <span
                  key={`${filter.key}-${filter.value}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1 pr-1.5 pl-3 text-xs font-medium text-gray-700"
                >
                  {filter.label}
                  <button
                    type="button"
                    onClick={() => onRemoveFilter(filter)}
                    className="flex size-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                    aria-label={`Eliminar filtro ${filter.label}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <Accordion type="multiple" defaultValue={defaultOpenValues}>
          {categoryOptions.length > 0 && (
            <AccordionItem value="categories" className="border-b">
              <AccordionTrigger className={TRIGGER_CLASS}>Categorías</AccordionTrigger>
              <AccordionContent className={CONTENT_CLASS}>
                <FilterGroup
                  items={categoryOptions.map((item) => ({
                    label: item.name,
                    value: item.id,
                    count: item.products_count,
                    checked: currentParams.categoryIds?.includes(item.id) ?? false,
                  }))}
                  onToggle={onToggleCategory}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {filters.flavors.length > 0 && (
            <AccordionItem value="flavors" className="border-b">
              <AccordionTrigger className={TRIGGER_CLASS}>Sabores</AccordionTrigger>
              <AccordionContent className={CONTENT_CLASS}>
                <FilterGroup
                  items={filters.flavors.map((flavor) => ({
                    label: flavor.name,
                    value: flavor.id,
                    count: flavor.products_count,
                    checked: currentParams.flavorIds?.includes(flavor.id) ?? false,
                  }))}
                  onToggle={(value) => onToggleList('flavorIds', value)}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {filters.attributions.length > 0 && (
            <AccordionItem value="attributions" className="border-b">
              <AccordionTrigger className={TRIGGER_CLASS}>Sellos</AccordionTrigger>
              <AccordionContent className={CONTENT_CLASS}>
                <FilterGroup
                  items={filters.attributions.map((attribution) => ({
                    label: attribution.name,
                    value: attribution.id,
                    count: attribution.products_count,
                    checked: currentParams.attributionIds?.includes(attribution.id) ?? false,
                  }))}
                  onToggle={(value) => onToggleList('attributionIds', value)}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {filters.attributes.map((attribute) => (
            <AccordionItem
              key={attribute.id}
              value={`attribute-${attribute.id}`}
              className="border-b"
            >
              <AccordionTrigger className={TRIGGER_CLASS}>{attribute.label}</AccordionTrigger>
              <AccordionContent className={CONTENT_CLASS}>
                <FilterGroup
                  items={attribute.options.map((option) => ({
                    label: option.value,
                    value: option.id,
                    count: option.products_count ?? 0,
                    checked: currentParams.attributeOptionIds?.includes(option.id) ?? false,
                  }))}
                  onToggle={(value) => onToggleList('attributeOptionIds', value)}
                />
              </AccordionContent>
            </AccordionItem>
          ))}

          <AccordionItem value="price" className="border-none">
            <AccordionTrigger className={TRIGGER_CLASS}>Precio</AccordionTrigger>
            <AccordionContent className={CONTENT_CLASS}>
              <div className="space-y-4">
                <Slider
                  min={filters.price.min}
                  max={filters.price.max}
                  step={1}
                  value={[priceMinInput ?? filters.price.min, priceMaxInput ?? filters.price.max]}
                  onValueChange={([min, max]) => {
                    setPriceMinInput(min);
                    setPriceMaxInput(max);
                  }}
                  onValueCommit={([min, max]) => onApplyPrice(min, max)}
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{formatCurrency(priceMinInput ?? filters.price.min)}</span>
                  <span>{formatCurrency(priceMaxInput ?? filters.price.max)}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}
