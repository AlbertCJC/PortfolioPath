import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  description: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  label: string;
}

interface ArchitectureGraphProps {
  data: {
    nodes: { id: string; group: number; description: string }[];
    links: { source: string; target: string; label: string }[];
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

    // Deep copy data to avoid mutating props
    const nodes: Node[] = data.nodes.map(d => ({ ...d }));
    const links: Link[] = data.links.map(d => ({ ...d }));

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(80));

    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 75) // Adjusted for wider nodes
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#3b82f6") // Blue color matching the image
      .attr("d", "M0,-5L10,0L0,5");

    const link = g.append("g")
      .attr("stroke", "#3b82f6") // Blue color matching the image
      .attr("stroke-opacity", 0.6)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end)");

    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .text(d => d.label);

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    // Add foreignObject for HTML content (rectangular cards)
    const nodeWidth = 140;
    const nodeHeight = 60;

    node.append("foreignObject")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .append("xhtml:div")
      .attr("class", "w-full h-full flex flex-col items-center justify-center bg-white border-2 border-blue-400 rounded-xl shadow-sm p-2 cursor-pointer transition-colors hover:bg-blue-50")
      .html(d => `
        <div class="text-xs font-semibold text-slate-700 text-center break-words w-full line-clamp-2">${d.id}</div>
      `);

    // Tooltip
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "absolute hidden bg-white text-slate-800 p-4 rounded-xl border border-blue-200 shadow-xl text-sm max-w-sm pointer-events-none z-50")
      .style("opacity", 0);

    node.on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1).style("display", "block");
      tooltip.html(`
        <div class="font-bold text-blue-600 mb-1 text-base border-b border-blue-100 pb-1">${d.id}</div>
        <div class="text-slate-600 mt-2">${d.description}</div>
      `);
      
      const [x, y] = d3.pointer(event, containerRef.current);
      tooltip.style("left", (x + 15) + "px").style("top", (y - 15) + "px");
      
      d3.select(event.currentTarget).select("div").classed("border-blue-600 shadow-md", true);
    })
    .on("mouseout", (event) => {
      tooltip.transition().duration(500).style("opacity", 0).on("end", function() {
        d3.select(this).style("display", "none");
      });
      d3.select(event.currentTarget).select("div").classed("border-blue-600 shadow-md", false);
    })
    .on("mousemove", (event) => {
      // Adjust tooltip position to stay within bounds if possible
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

    simulation.on("tick", () => {
      // Use orthogonal-like paths for links
      link.attr("d", (d: any) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;
        
        // Simple straight line for now, orthogonal is complex with force layout
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
      });

      linkLabels
        .attr("x", d => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr("y", d => ((d.source as Node).y! + (d.target as Node).y!) / 2);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-slate-50 rounded-2xl border border-slate-200">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      <div className="absolute bottom-4 left-4 text-xs text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
        Scroll to zoom, drag to pan and move nodes. Hover for details.
      </div>
    </div>
  );
};

export default ArchitectureGraph;
