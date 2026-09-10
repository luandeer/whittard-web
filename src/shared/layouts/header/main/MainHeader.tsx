import { MobileNavigation } from '@/modules/category-navigation/mobile/MobileNavigation';
import type { MegaMenuRoot } from '@/modules/category-navigation/types/megamenu.types';
import { Container } from '@/shared/components/custom-ui/Container';

import { Logo } from './Logo';
import { Search } from './search/Search';
import { UtilityNavigation } from './UtilityNavigation/UtilityNavigation';

interface MainHeaderProps {
  categories: MegaMenuRoot[];
}

export default function MainHeader({ categories }: MainHeaderProps) {
  return (
    <Container
      as="div"
      size="container"
      className="flex h-20 items-center justify-between gap-4 lg:gap-8"
    >
      <div className="flex items-center gap-2 lg:max-w-xs">
        <MobileNavigation categories={categories} />
        <div className="hidden flex-1 lg:block">
          <Search />
        </div>
      </div>
      <Logo src="/logo-whittard.png" alt="Whittard" />
      <UtilityNavigation />
    </Container>
  );
}
