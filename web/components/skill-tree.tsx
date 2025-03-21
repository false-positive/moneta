"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { initialNodes, links, Node } from "@/lib/cases/skill-tree"

export default function SkillTree() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [availablePoints, setAvailablePoints] = useState(5)

  // Function to check if a skill can be unlocked
  const canUnlock = (nodeId: string): boolean => {
    if (availablePoints <= 0) return false

    const parentLinks = links.filter((link) => link.target === nodeId)
    if (parentLinks.length === 0) return false

    return parentLinks.some((link) => {
      const parentNode = nodes.find((n) => n.id === link.source)
      return parentNode?.unlocked
    })
  }

  // Function to unlock a skill
  const unlockSkill = (nodeId: string) => {
    if (!canUnlock(nodeId) || availablePoints <= 0) return

    setNodes((prev) => {
      const updatedNodes = prev.map((node) =>
        node.id === nodeId ? { ...node, unlocked: true } : node,
      )
      // If the unlocked node is currently selected, update selectedNode
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(updatedNodes.find((node) => node.id === nodeId) || null)
      }
      return updatedNodes
    })
    setAvailablePoints((prev) => prev - 1)
  }

  const getCategoryColor = (node: Node) => {
    console.log(node.actionObject.kind)
    if (node.actionObject.kind === "investment") return "#f59e0b"
    if (node.actionObject.kind === "income") return "#10b981"
    if (node.actionObject.kind === "expense") return "#ef4444"
    if (node.actionObject.kind === "other") return "#34d399"
    return "#3730a3"
  }

  // Dummy submit handler
  const handleSubmit = () => {
    console.log("Submit button clicked")
    // Add your submission logic here.
  }

  useEffect(() => {
    if (!svgRef.current) return

    // Use the actual dimensions of the SVG container
    const width = svgRef.current.clientWidth || 600
    const height = svgRef.current.clientHeight || 400

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;")

    // Create a group for the graph
    const g = svg.append("g")

    // Define the rhombus size
    const baseSize = 22
    const getNodeSize = (node: Node) => baseSize

    // Draw links (behind nodes)
    g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("x1", (d: any) => {
        const source = nodes.find((n) => n.id === d.source)
        return source?.x || 0
      })
      .attr("y1", (d: any) => {
        const source = nodes.find((n) => n.id === d.source)
        return source?.y || 0
      })
      .attr("x2", (d: any) => {
        const target = nodes.find((n) => n.id === d.target)
        return target?.x || 0
      })
      .attr("y2", (d: any) => {
        const target = nodes.find((n) => n.id === d.target)
        return target?.y || 0
      })

    // Create node groups
    const nodeSelection = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("click", (event, d) => {
        setSelectedNode(d)
      })

    // Draw the rhombus shape for each node
    nodeSelection
      .append("path")
      .attr("d", (d) => {
        const size = getNodeSize(d)
        return `M 0,-${size} L ${size},0 L 0,${size} L -${size},0 Z`
      })
      .attr("fill", (d) => {
        if (!d.unlocked) return "#ccc"

        return getCategoryColor(d)
      })
      .attr("stroke", (d) => (getCategoryColor(d)))
      .attr("stroke-width", (d) => (canUnlock(d.id) && !d.unlocked ? 3 : 1.5))



    // Append the icon inside the rhombus.
    const iconSize = 16
    nodeSelection
      .append("image")
      .attr("href", (d: Node) => d.icon || "/icons/default-icon.svg")
      .attr("x", -iconSize / 2)
      .attr("y", -iconSize / 2)
      .attr("width", iconSize)
      .attr("height", iconSize)

    // Add node labels below the rhombus (if needed)
    nodeSelection
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => getNodeSize(d) + 15)
      .attr("fill", "currentColor")
      .attr("font-size", "10px")
    // Uncomment below if you want to display the name
    // .text((d) => d.name)

    // Add zoom functionality
    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
          g.attr("transform", event.transform)
        }) as any,
    )
  }, [nodes])

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 h-full">
      {/* Interactive Skill Tree Card */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Triviador-Style Skill Map</CardTitle>
            <CardDescription>
              Available skill points: <Badge variant="outline">{availablePoints}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            <div className="border rounded-md overflow-hidden bg-slate-50 dark:bg-slate-950 h-full">
              <svg ref={svgRef} className="w-full h-full"></svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The details container with relative positioning */}
      <div className="w-full md:w-80 relative">
        <Card>
          <CardHeader>
            <CardTitle>Skill Details</CardTitle>
            <CardDescription>Select a skill to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                  <div className="mt-2">
                    <Badge variant={selectedNode.unlocked ? "default" : "outline"}>
                      {selectedNode.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {!selectedNode.unlocked && canUnlock(selectedNode.id) && (
                    <Button
                      onClick={() => unlockSkill(selectedNode.id)}
                      className="w-full"
                      disabled={availablePoints <= 0}
                    >
                      Unlock Skill
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Click on a skill node to view details</p>
            )}
          </CardContent>
        </Card>

        {/* Submit button placed at the bottom right of this container */}
        <div className="absolute bottom-4 right-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  )
}
