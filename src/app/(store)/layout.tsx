import { NavigationService } from '@/modules/category-navigation/services/navigation.service';
import { ChatbotWrapper } from '@/modules/chat-bot/components/ChatbotWrapper';
import Footer from '@/shared/layouts/footer/Footer';
import Header from '@/shared/layouts/header/Header';

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigation = await NavigationService.getMegaMenu();

  return (
    <>
      <Header navigation={navigation} />
      {children}
      <Footer />
      <ChatbotWrapper />
    </>
  );
}
