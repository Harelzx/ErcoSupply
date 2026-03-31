'use client';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}

export function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color,
  bgColor = '#E8DCC8',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(Math.max(percent, 0), 1.5);
  const offset = circumference * (1 - Math.min(clampedPercent, 1));

  const resolvedColor = color ?? (
    percent >= 1 ? '#2A6E6A' :
    percent >= 0.8 ? '#C6963C' :
    '#C4704B'
  );

  const displayPercent = Math.round(percent * 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      style={{ direction: 'ltr' } as React.CSSProperties}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={resolvedColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          '--circumference': circumference,
          '--offset': offset,
        } as React.CSSProperties}
        className="animate-progress"
      />
      {/* Percentage text inside SVG — immune to RTL */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={resolvedColor}
        fontSize={size * 0.22}
        fontWeight="bold"
        fontFamily="var(--font-noto-hebrew), sans-serif"
        direction="ltr"
      >
        {displayPercent}%
      </text>
    </svg>
  );
}
