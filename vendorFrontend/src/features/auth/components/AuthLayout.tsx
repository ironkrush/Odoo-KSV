import bgImage from "../../../assets/lavender-bg.webp";
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden select-none"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-0" />

      {/* Main Centered Card: Sharp corners and interactive offset shadow */}
      <div className="relative w-full max-w-xl bg-white border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-none p-10 sm:p-14 z-10 animate-fade-in">
        <div className="w-full max-w-md mx-auto py-4">
          {children}
        </div>
      </div>
    </div>
  );
}


