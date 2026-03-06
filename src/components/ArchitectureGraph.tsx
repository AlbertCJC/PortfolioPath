import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';

interface Node {
  id: string;
  group: number;
  description: string;
}

interface Link {
  source: string;
  target: string;
  label: string;
}

interface ArchitectureGraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
}

const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data || !data.nodes || !data.links) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

    // Add zoom capabilities
    const g = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);

    // Setup Dagre graph
    const gDagre = new dagre.graphlib.Graph();
    gDagre.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 100, marginx: 40, marginy: 40 });
    gDagre.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 160;
    const nodeHeight = 60;

    data.nodes.forEach(node => {
      gDagre.setNode(node.id, { 
        label: node.id, 
        width: nodeWidth, 
        height: nodeHeight, 
        description: node.description,
        group: node.group
      });
    });

    data.links.forEach(link => {
      gDagre.setEdge(link.source, link.target, { label: link.label });
    });

    // Compute layout
    dagre.layout(gDagre);

    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8) // Adjusted for edge points
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#10b981") // Emerald color
      .attr("d", "M0,-5L10,0L0,5");

    // Draw edges
    const edges = gDagre.edges().map(e => {
      const edge = gDagre.edge(e) as { points: { x: number; y: number }[]; label?: string };
      return {
        ...edge,
        source: e.v,
        target: e.w
      };
    });

    const line = d3.line<{x: number, y: number}>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveBasis);

    const link = g.append("g")
      .attr("stroke", "#10b981")
      .attr("stroke-opacity", 0.6)
      .selectAll("path")
      .data(edges)
      .join("path")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end)")
      .attr("d", d => line(d.points));

    const linkLabels = g.append("g")
      .selectAll("text")
      .data(edges)
      .join("text")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .attr("x", d => {
        // Find the middle point of the edge for the label
        const midPoint = d.points[Math.floor(d.points.length / 2)];
        return midPoint ? midPoint.x : 0;
      })
      .attr("y", d => {
        const midPoint = d.points[Math.floor(d.points.length / 2)];
        return midPoint ? midPoint.y - 5 : 0;
      })
      .text(d => d.label);

    // Draw nodes
    const nodes = gDagre.nodes().map(v => {
      const node = gDagre.node(v) as { x: number; y: number; width: number; height: number; description?: string; group?: number; label?: string };
      return {
        id: v,
        ...node
      };
    });

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("foreignObject")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .append("xhtml:div")
      .attr("class", "w-full h-full flex flex-col items-center justify-center bg-slate-800 border-2 border-emerald-500/50 rounded-xl shadow-sm p-2 transition-colors hover:bg-slate-700")
      .html(d => `
        <div class="text-xs font-semibold text-slate-200 text-center break-words w-full line-clamp-2">${d.id}</div>
      `);

    // Tooltip
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "absolute hidden bg-slate-800 text-slate-200 p-4 rounded-xl border border-slate-700 shadow-xl text-sm max-w-sm pointer-events-none z-50")
      .style("opacity", 0);

    node.on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1).style("display", "block");
      tooltip.html(`
        <div class="font-bold text-emerald-400 mb-1 text-base border-b border-slate-700 pb-1">${d.id}</div>
        <div class="text-slate-400 mt-2">${d.description}</div>
      `);
      
      const [x, y] = d3.pointer(event, containerRef.current);
      tooltip.style("left", (x + 15) + "px").style("top", (y - 15) + "px");
      
      d3.select(event.currentTarget).select("div").classed("border-emerald-400 shadow-md", true);
    })
    .on("mouseout", (event) => {
      tooltip.transition().duration(500).style("opacity", 0).on("end", function() {
        d3.select(this).style("display", "none");
      });
      d3.select(event.currentTarget).select("div").classed("border-emerald-400 shadow-md", false);
    })
    .on("mousemove", (event) => {
      const tooltipEl = tooltip.node() as HTMLElement;
      const containerEl = containerRef.current;
      
      if (tooltipEl && containerEl) {
        const [x, y] = d3.pointer(event, containerEl);
        let left = x + 15;
        let top = y - 15;
        
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const containerRect = containerEl.getBoundingClientRect();
        
        if (left + tooltipRect.width > containerRect.width) {
          left = x - tooltipRect.width - 15;
        }
        
        if (top + tooltipRect.height > containerRect.height) {
          top = y - tooltipRect.height - 15;
        }
        
        tooltip.style("left", left + "px").style("top", top + "px");
      }
    });

    // Center the graph
    const graphWidth = gDagre.graph().width || 0;
    const graphHeight = gDagre.graph().height || 0;
    const initialScale = Math.min(
      (width - 40) / graphWidth,
      (height - 40) / graphHeight,
      1 // Don't scale up more than 1x
    );
    
    const xCenterOffset = (width - graphWidth * initialScale) / 2;
    const yCenterOffset = (height - graphHeight * initialScale) / 2;
    
    svg.call(zoom.transform as any, d3.zoomIdentity.translate(xCenterOffset, yCenterOffset).scale(initialScale));

    return () => {
      tooltip.remove();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent rounded-2xl border border-slate-800/50">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm">
        Scroll to zoom, drag to pan. Hover for details.
      </div>
    </div>
  );
};

export default ArchitectureGraph;
