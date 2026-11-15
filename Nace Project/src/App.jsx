import NeptonChatbot from './components/NeptonChatbot';

const defaultContext = {
  country: 'Argentina',
  minConfidence: 65,
  dayNight: 'Night',
  yearRange: '2006–2026',
  activeYear: 2026,
  activeDate: new Date().toISOString().slice(0, 10),
  activeFireCount: null,
  selectedHotspot: 'FIR-1042',
  selectedFireInspector: null,
};

export default function App() {
  return (
    <div className="min-h-screen bg-void text-bone">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="w-full rounded-none border border-line bg-surface p-8">
          <p className="lb mb-4 text-fire">NEPTON</p>
          <h1 className="font-display text-4xl uppercase tracking-[0.18em] text-bone">Wildfire Activity Engine</h1>
          <p className="mt-4 max-w-2xl font-mono text-sm text-mute leading-relaxed">
            Monitoring active fire clusters, historical anomalies, and live context in a single mission-control surface.
          </p>
        </div>
      </div>

      <NeptonChatbot
        context={defaultContext}
        avatarSrc="/src/assets/nepton-avatar.jpg"
        onFlyToHotspot={(fire) => {
          console.log('Fly to hotspot', fire);
        }}
      />
    </div>
  );
}
