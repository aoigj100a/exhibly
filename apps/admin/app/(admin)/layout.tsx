import AccountBar from "./components/AccountBar";
import GuestBanner from "./components/GuestBanner";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AccountBar />
      <GuestBanner />
      {children}
    </>
  );
}
