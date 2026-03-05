export const metadata = {
  title: 'Platform Wire',
  description: '플랫폼 비즈니스 · 디지털 대전환 뉴스 포스팅 자동화',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{margin:0}}>{children}</body>
    </html>
  )
}
