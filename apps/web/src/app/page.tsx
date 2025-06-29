export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-brand-background">
      <div className="text-center">
        {/* Placeholder for logo */}
        <div className="w-24 h-24 bg-brand-primary rounded-full mx-auto mb-4"></div>
        <h1 className="text-4xl font-bold text-brand-text">
          Welcome to SA Budget Queen
        </h1>
        <p className="text-lg text-brand-text mt-2">
          Your journey to financial freedom starts here.
        </p>
      </div>
    </main>
  );
}
