"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {allActionsList, initialNodes, links, Node} from "@/lib/cases/skill-tree"
import {Info} from "lucide-react";
import {computeNextStep, Step} from "@/lib/cases/actions";
import {lifeAction} from "@/lib/cases/standard-actions";
import SuperJSON from "superjson";
import {Textarea} from "@/components/ui/textarea";

export default function SkillTree() {
  const svgRef = useRef<SVGSVGElement>(null)
  const stepsRef = useRef<Step[]>([])
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [availablePoints, setAvailablePoints] = useState(5)
  const [newlyUnlockedActions, setNewlyUnlockedActions] = useState<string[]>([])
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    const storedSteps = localStorage.getItem("steps")
    const parsedSteps: Step[] = SuperJSON.parse(storedSteps || "[]")

    if (parsedSteps && parsedSteps.length > 0) {
      stepsRef.current = parsedSteps
    } else {
      const initialStep: Step = {
        tick: 0,
        bankAccount: 10_000,
        joy: 100,
        freeTime: 2134,
        newActions: [],
        oldActiveActions: [],
      }
      stepsRef.current = [initialStep]
    }

    // now check if there are any unlocked actions
    const unlockedActions = stepsRef.current.map((step) => step.newActions)
    const unlockedActionNames = unlockedActions.flat().map((action) => action.name)

    // now check the nodes variable and set the unlocked property to true for the unlocked actions
    const updatedNodes = nodes.map((node) => {
      if (unlockedActionNames.includes(node.actionObject.name)) {
        return { ...node, unlocked: true }
      }
      return node
    })

    setNodes(updatedNodes)
  }, [])

  // Function to check if a skill can be unlocked
  const canUnlock = (nodeId: string): boolean => {
    if (availablePoints <= 0) return false

    return true
    //
    // const parentLinks = links.filter((link) => link.target === nodeId)
    // if (parentLinks.length === 0) return false
    //
    // return parentLinks.some((link) => {
    //   const parentNode = nodes.find((n) => n.id === link.source)
    //   return parentNode?.unlocked
    // })
  }

  // Function to unlock a skill
  const unlockSkill = (nodeId: string) => {
    if (!canUnlock(nodeId) || availablePoints <= 0) return

    setNodes((prev) => {
      const updatedNodes = prev.map((node) =>
        node.id === nodeId ? { ...node, unlocked: true } : node,
      )

      // Update selectedNode if needed
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(updatedNodes.find((node) => node.id === nodeId) || null)
      }

      // Add to newly unlocked actions
      const unlockedNode = updatedNodes.find((n) => n.id === nodeId)
      if (unlockedNode) {
        setNewlyUnlockedActions((prevActions) => [
          ...prevActions,
          unlockedNode.actionObject.name, // or unlockedNode.id
        ])
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

    // get all unlocked nodes
    const unlockedNodes = nodes.filter((node) => node.unlocked)
    console.log(unlockedNodes)

    // extract all actions from unlocked nodes
    const unlockedActions = unlockedNodes.map((node) => node.actionObject)
    const nextStep = computeNextStep(stepsRef.current[stepsRef.current.length - 1], unlockedActions)

    stepsRef.current.push(nextStep)
    localStorage.setItem("steps", SuperJSON.stringify(stepsRef.current))
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
        if (!d.unlocked) return "#fff"

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

// Define initial zoom transform
    const initialScale = 2.5 // You can adjust this
    const initialX = -(width / 2) - 400
    const initialY = -(height / 2) - 50

    const zoom = d3
      .zoom()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      }) as any

      // Call zoom behavior
    svg.call(zoom)

    // Apply initial transform
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(initialX, initialY)
        .scale(initialScale)
    )
  }, [nodes])

  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendHint = async (question = "") => {
    if (!selectedNode) {
      return;
    }

    try {
      let body;
      if (question) {
        body = JSON.stringify({
          "action_name": selectedNode?.actionObject.name,
          actions: allActionsList,
          question
        });
      } else {
        body = JSON.stringify({
          "action_name": selectedNode?.actionObject.name,
          actions: allActionsList,
        })
      }

      const response = await fetch('http://192.168.74.18:5000/hint', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (response.ok) {
        const data = await response.json();
        const hint = data.response || "🔍 Try clicking on a skill node to view more details.";
        setMessages((prev) => [...prev, { role: "assistant", content: hint }]);
      } else {
        // Fallback in case of response error
        const fallbackHint = "🔍 Try clicking on a skill node to view more details.";
        setMessages((prev) => [...prev, { role: "assistant", content: fallbackHint }]);
      }
    } catch (error) {
      // Handle any errors and use a fallback hint
      const fallbackHint = "🔍 Try clicking on a skill node to view more details.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallbackHint }]);
    } finally {
      setShowChat(true);
    }
  };

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
          <CardHeader className="flex items-start justify-between">
            <div>
              <CardTitle>Skill Details</CardTitle>
              <CardDescription>Select a skill to view details</CardDescription>
            </div>
            <div className="relative group mt-1">
              <button
                className="w-7 h-7 rounded-full bg-black/80 flex items-center
             justify-center transition-all duration-300
             hover:bg-black hover:scale-110 group"
                onClick={() => sendHint()}  // <-- Toggle showChat here
              >
                <Info className="h-6 w-6 text-white group-hover:animate-pulse"/>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedNode.actionObject.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedNode.actionObject.shortDescription}</p>
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

        <div
          className={`mt-4 transition-all duration-500 ease-in-out transform origin-top overflow-hidden
       ${showChat ? "opacity-100 scale-y-100 h-96" : "opacity-0 scale-y-0 h-0"}`}
        >
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
              <CardDescription>Ask for guidance or hints</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 space-y-2 overflow-hidden">
              {/* Message list with scroll */}
              <div
                className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2 bg-slate-50 dark:bg-slate-900 text-sm">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded-md max-w-[90%] break-words ${
                      msg.role === "user"
                        ? "ml-auto bg-blue-500 text-white"
                        : "mr-auto bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>

              {/* Input area */}
              <form
                className="flex items-center gap-2 pt-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!chatInput.trim()) return

                  const input = chatInput.trim()
                  setMessages((prev) => [...prev, {role: "user", content: input}])
                  setChatInput("")
                  sendHint(input)
                }}
              >
                <Textarea
                  placeholder="Type your question..."
                  className="flex-1 resize-none"
                  rows={2}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      e.currentTarget.form?.requestSubmit()
                    }
                  }}
                />
                <Button type="submit">Send</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/*<div>*/}
        {/*<ChatInterface></ChatInterface>*/}
        {/*</div>*/}

        {/* Submit button placed at the bottom right of this container */}
        <div className="absolute bottom-4 right-4">
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  )
}
