'use client';

import { useScrollTop } from '@/lib/hooks/useScrollTop';
import { cn } from '@/lib/utils';
import { CategoryNavigation } from '@/modules/category-navigation/CategoryNavigation';
import type { MegaMenuRoot } from '@/modules/category-navigation/types/megamenu.types';
import { Container } from '@/shared/components/custom-ui/Container';

import MainHeader from './main/MainHeader';
import { PromotionBar } from './promotion-bar/PromotionBar';
import UtilityBar from './utility-bar/UtilityBar';

interface HeaderProps {
  navigation: MegaMenuRoot[];
}

export default function Header({ navigation }: HeaderProps) {
  const isAtTop = useScrollTop(56);

  return (
    <Container as="header" size="full" className="bg-brand-primary z-sticky sticky top-0">
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
          isAtTop ? 'grid-rows-[1fr] opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <PromotionBar />
        </div>
      </div>
      <UtilityBar />
      <MainHeader categories={navigation} />
      <CategoryNavigation categories={navigation} />
    </Container>
  );
}
