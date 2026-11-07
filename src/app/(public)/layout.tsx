export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Remove dark class before first paint so public pages always render in light mode */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.remove('dark','theme-ready')",
        }}
      />
      {children}
    </>
  );
}
