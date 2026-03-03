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

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#94a3b8")
      .attr("d", "M0,-5L10,0L0,5");

    const link = g.append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#end)");

    const linkLabels = g.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("font-size", "10px")
      .attr("fill", "#94a3b8")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .text(d => d.label);

    const node = g.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 20)
      .attr("fill", d => color(d.group.toString()))
      .call(drag(simulation) as any);

    const nodeLabels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("font-size", "12px")
      .attr("fill", "#f8fafc")
      .attr("text-anchor", "middle")
      .attr("dy", 35)
      .text(d => d.id);

    // Tooltip
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "absolute hidden bg-slate-800 text-slate-200 p-3 rounded-lg border border-slate-700 shadow-xl text-sm max-w-xs pointer-events-none z-50")
      .style("opacity", 0);

    node.on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", 1).style("display", "block");
      tooltip.html(`<strong>${d.id}</strong><br/>${d.description}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      
      d3.select(event.currentTarget).attr("stroke", "#10b981").attr("stroke-width", 3);
    })
    .on("mouseout", (event) => {
      tooltip.transition().duration(500).style("opacity", 0).on("end", function() {
        d3.select(this).style("display", "none");
      });
      d3.select(event.currentTarget).attr("stroke", "#fff").attr("stroke-width", 1.5);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px");
    });

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      linkLabels
        .attr("x", d => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr("y", d => ((d.source as Node).y! + (d.target as Node).y!) / 2);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      nodeLabels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
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
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#131825] rounded-2xl border border-slate-800/50">
      <svg ref={svgRef} className="w-full h-full cursor-move" />
      <div className="absolute bottom-4 left-4 text-xs text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
        Scroll to zoom, drag to pan and move nodes
      </div>
    </div>
  );
};

export default ArchitectureGraph;
