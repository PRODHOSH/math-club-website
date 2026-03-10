export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning math symbol */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-yellow-500/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-yellow-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-t-2 border-yellow-300/60 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center text-yellow-400 text-xl font-bold select-none">
            ∑
          </div>
        </div>
        {/* Pulsing dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-yellow-400/70 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
