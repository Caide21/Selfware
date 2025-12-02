import { PrismPaperProvider } from '@/components/Themes/PrismPaper';

export function PrismThemeProvider({ children }) {
  return <PrismPaperProvider>{children}</PrismPaperProvider>;
}

export default PrismThemeProvider;
