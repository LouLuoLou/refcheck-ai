export function ArchitectureDiagram() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface p-6 md:p-10">
      <svg
        viewBox="0 0 960 420"
        className="w-full h-auto"
        role="img"
        aria-label="RefCheck AI architecture: client uploads video to server action, which uploads to Gemini Files API, runs play understanding, selects rules verbatim, synthesizes verdict, validates citations, and returns to client for display."
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#F5C518" />
          </marker>
          <linearGradient id="nodeBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1d" />
            <stop offset="100%" stopColor="#121214" />
          </linearGradient>
        </defs>

        {/* Title */}
        <text
          x="480"
          y="28"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          letterSpacing="4"
          fill="#A8A29E"
        >
          REFCHECK AI · PIPELINE
        </text>

        {/* Swim lanes */}
        <g opacity="0.4">
          <line x1="40" y1="70" x2="920" y2="70" stroke="#F5F5F4" strokeOpacity="0.1" />
          <line x1="40" y1="220" x2="920" y2="220" stroke="#F5F5F4" strokeOpacity="0.1" />
          <line x1="40" y1="370" x2="920" y2="370" stroke="#F5F5F4" strokeOpacity="0.1" />
        </g>

        <g>
          <text x="40" y="60" fontFamily="ui-monospace" fontSize="10" letterSpacing="3" fill="#A8A29E">BROWSER</text>
          <text x="40" y="210" fontFamily="ui-monospace" fontSize="10" letterSpacing="3" fill="#A8A29E">NEXT.JS SERVER</text>
          <text x="40" y="360" fontFamily="ui-monospace" fontSize="10" letterSpacing="3" fill="#A8A29E">GOOGLE AI</text>
        </g>

        {/* Nodes */}
        {/* Browser */}
        <Node x={80} y={100} w={200} h={70} label="Upload clip" sub="AnalyzeForm.tsx" />
        <Node x={680} y={100} w={200} h={70} label="Verdict page" sub="VerdictClient.tsx" />

        {/* Server */}
        <Node x={80} y={250} w={200} h={70} label="describePlay action" sub="actions/describe-play.ts" accent />
        <Node x={380} y={250} w={200} h={70} label="Rule selection" sub="lib/rules/basketball.ts" />
        <Node x={680} y={250} w={200} h={70} label="synthesizeVerdict action" sub="actions/synthesize-verdict.ts" accent />

        {/* Gemini */}
        <Node x={80} y={385} w={200} h={28} label="Files API · video upload" mini />
        <Node x={380} y={385} w={200} h={28} label="Gemini 2.5 Pro · Stage 3" mini />
        <Node x={680} y={385} w={200} h={28} label="Gemini 2.5 Pro · Stage 5" mini />

        {/* Arrows */}
        <Arrow d="M 180 170 L 180 250" />
        <Arrow d="M 180 320 L 180 385" />
        <Arrow d="M 180 320 C 180 360, 480 330, 480 320" />
        <Arrow d="M 480 320 L 480 385" />
        <Arrow d="M 280 285 L 380 285" />
        <Arrow d="M 580 285 L 680 285" />
        <Arrow d="M 780 250 L 780 170" />
        <Arrow d="M 780 320 L 780 385" />
      </svg>
    </div>
  );
}

function Node({
  x,
  y,
  w,
  h,
  label,
  sub,
  accent,
  mini,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: boolean;
  mini?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill="url(#nodeBg)"
        stroke={accent ? "#F5C518" : "rgba(245,245,244,0.18)"}
        strokeWidth={accent ? 1.5 : 1}
      />
      <text
        x={x + w / 2}
        y={y + (mini ? 18 : 30)}
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={mini ? 12 : 14}
        fill="#F5F5F4"
      >
        {label}
      </text>
      {sub && !mini && (
        <text
          x={x + w / 2}
          y={y + 52}
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          letterSpacing="1"
          fill="#A8A29E"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Arrow({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="#F5C518"
      strokeOpacity="0.55"
      strokeWidth={1.3}
      markerEnd="url(#arrow)"
    />
  );
}
