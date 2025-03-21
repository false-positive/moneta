"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define the data structure for our skill tree,
// now with an optional icon field for each node.
interface Node {
  id: string
  name: string
  level: number
  description: string
  unlocked: boolean
  icon?: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface Link {
  source: string
  target: string
}

// Sample data with each node having a different icon.
const initialNodes: Node[] = [
  {
    id: "core",
    name: "Core Skill",
    level: 1,
    description: "The foundation of all other skills",
    unlocked: true,
    x: 300,
    y: 200,
    icon: "/icons/core.svg",
  },
  { id: "skill1", name: "Skill 1", level: 0, description: "First branch skill", unlocked: false, x: 275, y: 175, icon: "/icons/skill1.svg" },
  { id: "skill2", name: "Skill 2", level: 0, description: "Second branch skill", unlocked: false, x: 325, y: 175, icon: "/icons/skill2.svg" },
  { id: "skill3", name: "Skill 3", level: 0, description: "Third branch skill", unlocked: false, x: 275, y: 225, icon: "/icons/skill3.svg" },
  { id: "skill4", name: "Skill 4", level: 0, description: "Fourth branch skill", unlocked: false, x: 325, y: 225, icon: "/icons/skill4.svg" },
  { id: "skill1a", name: "Skill 1A", level: 0, description: "Advanced skill from branch 1", unlocked: false, x: 100, y: 120, icon: "/icons/skill1a.svg" },
  { id: "skill1b", name: "Skill 1B", level: 0, description: "Advanced skill from branch 1", unlocked: false, x: 100, y: 200, icon: "/icons/skill1b.svg" },
  { id: "skill2a", name: "Skill 2A", level: 0, description: "Advanced skill from branch 2", unlocked: false, x: 350, y: 150, icon: "/icons/skill2a.svg" },
  { id: "skill2c", name: "Skill 2C", level: 0, description: "Advanced skill from branch 2", unlocked: false, x: 375, y: 175, icon: "/icons/skill2c.svg" },
  { id: "skill2d", name: "Skill 2D", level: 0, description: "Advanced skill from branch 2", unlocked: false, x: 325, y: 125, icon: "/icons/skill2d.svg" },
]

const links: Link[] = [
  { source: "core", target: "skill1" },
  { source: "core", target: "skill2" },
  { source: "core", target: "skill3" },
  { source: "core", target: "skill4" },
  { source: "skill1", target: "skill1a" },
  { source: "skill1", target: "skill1b" },
  { source: "skill2", target: "skill2a" },
  { source: "skill2c", target: "skill2a" },
  { source: "skill2d", target: "skill2a" },
]

export default function SkillTree() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [availablePoints, setAvailablePoints] = useState(5)

  // Function to check if a skill can be unlocked
  const canUnlock = (nodeId: string): boolean => {
    if (availablePoints <= 0) return false

    // Check if any parent nodes are unlocked
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

    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, unlocked: true, level: 1 } : node)),
    )
    setAvailablePoints((prev) => prev - 1)
  }

  // Function to upgrade a skill
  const upgradeSkill = (nodeId: string) => {
    if (availablePoints <= 0) return

    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId && node.unlocked && node.level < 3 ? { ...node, level: node.level + 1 } : node,
      ),
    )
    setAvailablePoints((prev) => prev - 1)
  }

  // Dummy submit handler – you can add your submission logic here
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

    // Define the rhombus size – smaller to allow for closer positioning
    const baseSize = 22
    const getNodeSize = (node: Node) => baseSize

    // Create the links first so they appear behind nodes
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

    // Create the nodes
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

    // Add the rhombus shape to each node
    nodeSelection
      .append("path")
      .attr("d", (d) => {
        const size = getNodeSize(d)
        return `M 0,-${size} L ${size},0 L 0,${size} L -${size},0 Z`
      })
      .attr("fill", (d) => {
        if (!d.unlocked) return "#ccc"
        if (d.level === 0) return "#6366f1"
        if (d.level === 1) return "#4f46e5"
        if (d.level === 2) return "#4338ca"
        return "#3730a3"
      })
      .attr("stroke", (d) => (canUnlock(d.id) && !d.unlocked ? "#10b981" : "#333"))
      .attr("stroke-width", (d) => (canUnlock(d.id) && !d.unlocked ? 3 : 1.5))

    // Append the icon inside the rhombus.
    // Use the node's icon field, or fall back to a default icon.
    const iconSize = 16
    nodeSelection
      .append("image")
      .attr("href", (d: Node) => d.icon || "/icons/default-icon.svg")
      .attr("x", -iconSize / 2)
      .attr("y", -iconSize / 2)
      .attr("width", iconSize)
      .attr("height", iconSize)

    // Add node labels below the rhombus
    nodeSelection
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => getNodeSize(d) + 15)
      .attr("fill", "currentColor")
      .attr("font-size", "10px")
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
                      {selectedNode.unlocked ? `Level ${selectedNode.level}` : "Locked"}
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

                  {selectedNode.unlocked && selectedNode.level < 3 && (
                    <Button
                      onClick={() => upgradeSkill(selectedNode.id)}
                      className="w-full"
                      disabled={availablePoints <= 0}
                    >
                      Upgrade to Level {selectedNode.level + 1}
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
