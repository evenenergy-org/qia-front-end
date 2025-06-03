import './globals.css';
import 'jigi/dist/jigi.css';

export const metadata = {
  title: '恰谷图片编辑器',
  description: '恰谷图片编辑器应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
} 