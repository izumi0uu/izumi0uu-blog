import * as React from "react";

export type OptionalTeam = "YELLOW" | "BLUE" | "RED" | "UNKNOWN";

function polarToCartesian(x: number, y: number, r: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180.0;
  return [x + r * Math.cos(radians), y + r * Math.sin(radians)];
}

function getSegmentPath(
  {
    size,
    margin = 0.1,
    segments,
    radius = size / 2,
    width = 1,
  }: {
    size: number;
    margin?: number;
    segments: number;
    radius?: number;
    width?: number;
  },
  segment: number,
  span = 1
) {
  const center = size / 2;
  const degrees = 360 / segments;
  const shift = margin === 0 ? -90 : -90 + (degrees * margin) / 2;
  const start = shift + degrees * segment;
  const end = shift + degrees * (segment + span - margin) + (margin == 0 ? 1 : 0);
  const innerRadius = radius - width;

  const arc = Math.abs(start - end) > 180 ? 1 : 0;
  const point = (rad: number, deg: number) =>
    polarToCartesian(center, center, rad, deg)
      .map((n) => n.toPrecision(5))
      .join(",");

  return [
    `M${point(radius, start)}`,
    `A${radius},${radius},0,${arc},1,${point(radius, end)}`,
    `L${point(radius - width, end)}`,
    `A${innerRadius},${innerRadius},0,${arc},0,${point(innerRadius, start)}`,
    "Z",
  ].join("");
}

const colors: Record<OptionalTeam, string> = {
  YELLOW: "text-team-yellow",
  BLUE: "text-team-blue",
  RED: "text-team-red",
  UNKNOWN: "text-team-unknown",
};

interface TeamCircleProps {
  size: number;
  width?: number;
  team: OptionalTeam;
}

const TeamCircle: React.FC<TeamCircleProps> = React.memo(({ size, width = 2, team }) => {
  // 使用ref跟踪SVG元素
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  // 在组件卸载时清理
  React.useEffect(() => {
    return () => {
      // 清理SVG引用
      if (svgRef.current) {
        // 清理可能的React内部属性
        const svgElement = svgRef.current as any;
        if (svgElement.__reactProps$) {
          svgElement.__reactProps$ = undefined;
        }
        if (svgElement.__reactFiber$) {
          svgElement.__reactFiber$ = undefined;
        }

        // 清理子path元素
        const pathElements = svgRef.current.querySelectorAll("path");
        pathElements.forEach((path: any) => {
          if (path.__reactProps$) {
            path.__reactProps$ = undefined;
          }
          if (path.__reactFiber$) {
            path.__reactFiber$ = undefined;
          }
        });

        // 清理引用
        svgRef.current = null;
      }
    };
  }, []);

  // 预计算路径以减少重新渲染时的计算
  const renderTeamCircle = React.useMemo(() => {
    let options = { size, width, margin: 0.05, segments: 3 };

    if (team === "UNKNOWN") {
      return (
        <>
          <path d={getSegmentPath(options, 0)} className="text-team-yellow" fill="currentColor" />
          <path d={getSegmentPath(options, 1)} className="text-team-blue" fill="currentColor" />
          <path d={getSegmentPath(options, 2)} className="text-team-red" fill="currentColor" />
        </>
      );
    }

    const [teamOne, teamTwo] = Object.keys(colors).filter((x) => x !== team) as [
      OptionalTeam,
      OptionalTeam,
    ];

    // The relative size of the "current team" compared to the other teams. A 3
    // means that the current team is rendered 3 times as large as the other teams.
    const teamSpan = 3;
    options = { ...options, segments: 2 + 2 * teamSpan };

    return (
      <>
        <path
          d={getSegmentPath(options, 0, teamSpan)}
          className={colors[team]}
          fill="currentColor"
        />
        <path
          d={getSegmentPath(options, teamSpan)}
          className={colors[teamOne]}
          fill="currentColor"
        />
        <path
          d={getSegmentPath(options, teamSpan + 1, teamSpan)}
          className={colors[team]}
          fill="currentColor"
        />
        <path
          d={getSegmentPath(options, options.segments - 1)}
          className={colors[teamTwo]}
          fill="currentColor"
        />
      </>
    );
  }, [size, width, team]);

  return (
    <svg height={size} width={size} viewBox={`0 0 ${size} ${size}`} ref={svgRef}>
      {renderTeamCircle}
    </svg>
  );
});

TeamCircle.displayName = "TeamCircle";

export { TeamCircle };
