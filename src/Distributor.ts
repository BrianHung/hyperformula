import {Graph} from "./Graph";
import {CellVertex, Vertex} from "./Vertex";
import {AddressMapping} from "./AddressMapping";
import {SimpleArrayAddressMapping} from "./SimpleArrayAddressMapping";
import {Pool} from "./worker/Pool";

export class Distributor {
  private pool: Pool

  private initialized: number
  private finished: number
  private finishedPromiseResolver?: any

  constructor(
      private graph: Graph<Vertex>,
      private addressMapping: SimpleArrayAddressMapping,
      private numberOfWorkers: number = 3
  ) {
    this.pool = new Pool(this.numberOfWorkers)
    this.pool.init()
    this.initialized = 0
    this.finished = 0
  }


  public distribute() {
    const startedAt = Date.now()
    let { sorted, cycled, longestPathSize } = this.topSort()

    console.log(longestPathSize)

    const colorMap : Map<Color, Vertex[]> = new Map()
    for (let i=0; i<this.numberOfWorkers; ++i) {
      colorMap.set(i, [])
    }

    const edges : Map<Color, Map<Vertex, Set<Vertex>>> = new Map()
    const edgesCount : Map<Color, number> = new Map()
    for (let i=0; i<this.numberOfWorkers; ++i) {
      edges.set(i, new Map())
      edgesCount.set(i, 0)
    }

    for (let i=0; i<sorted.length; ++i) {
      const colors : Set<number> = new Set()
      colorMap.get(sorted[i].color)!.push(sorted[i])
      this.graph.getEdges().get(sorted[i])!.forEach(vertex => {
        if (vertex.color != sorted[i].color) {
          colors.add(vertex.color)
        }
        let tempMap = edges.get(vertex.color)!

        if (!tempMap.has(sorted[i])) {
          tempMap.set(sorted[i], new Set())
        }

        tempMap.get(sorted[i])!.add(vertex)
        edgesCount.set(vertex.color, edgesCount.get(vertex.color)!+1)
      })
      colors.forEach(color => colorMap.get(color)!.push(sorted[i]))
    }

    const coloredChunks: Map<Color, WorkerInitPayload> = new Map()

    for (let i=0; i<this.numberOfWorkers; ++i) {
      coloredChunks.set(i, {
        type: "INIT",
        nodes: colorMap.get(i)!,
        edges: this.serializeEdges(edges.get(i)!, edgesCount.get(i)!),
        addressMapping: this.addressMapping.mapping,
        sheetWidth: this.addressMapping.getWidth(),
        sheetHeight: this.addressMapping.getHeight(),
        numberOfWorkers: this.numberOfWorkers,
        color: i
      })
    }

    const finishedAt = Date.now()
    console.warn(`Distribution finished in ${finishedAt - startedAt}`)
    const finishedPromise = new Promise((resolve, reject) => {
      this.finishedPromiseResolver = resolve
      this.pool.addWorkerTaskForAllWorkers((workerId: number) => {
        return {
          data: coloredChunks.get(workerId),
          callback: this.onWorkerMessage(this),
        }
      })
    })

    return finishedPromise
  }

  private onWorkerMessage(that: Distributor) {
    return (message: any) => {
      switch (message.data.type) {
        case "INITIALIZED": {
          this.initialized += 1
          if (this.initialized == this.numberOfWorkers) {
            this.pool.addWorkerTaskForAllWorkers((workerId: number) => {
              return {
                data: {
                  type: "START"
                },
                callback: that.onWorkerMessage(that)
              }
            })
          }
          break
        }
        case "FINISHED": {
          this.finished += 1
          if (this.finished == this.numberOfWorkers) {
            this.finishedPromiseResolver()
          }
        }
      }
    }
  }

  public serializeEdges(edges: Map<Vertex, Set<Vertex>>, edgesCount: number): Int32Array {
    const result = new Int32Array(edgesCount * 2)
    let i = 0
    edges.forEach((targetNodes, sourceNode) => {
      targetNodes.forEach((targetNode) => {
        result[i] = sourceNode.vertexId
        result[i+1] = targetNode.vertexId
        i += 2
      })
    })
    return result
  }

  public topSort(): { sorted: Vertex[], cycled: Vertex[], longestPathSize: number } {
    const incomingEdges = this.incomingEdges()
    const dominantColors = this.initDominantColors()
    const distances = new Int32Array(this.graph.nodes.size)

    const danglingNodes = this.colorNodes(this.danglingNodes(incomingEdges))

    let currentNodeIndex = 0
    const sorted: Vertex[] = []

    while (currentNodeIndex < danglingNodes.length) {
      const node = danglingNodes[currentNodeIndex]

      sorted.push(node)

      this.graph.getEdges().get(node)!.forEach((targetNode) => {
        distances[targetNode.vertexId] = Math.max(distances[targetNode.vertexId], distances[node.vertexId] + 1)

        ++dominantColors.get(targetNode)![node.color]
        incomingEdges.set(targetNode, incomingEdges.get(targetNode)! - 1)

        if (incomingEdges.get(targetNode) === 0) {
          targetNode.color = this.getDominantColor(dominantColors.get(targetNode)!)
          danglingNodes.push(targetNode)
        }
      })

      ++ currentNodeIndex
    }

    const longestPathSize = Math.max(...distances) + 1

    if (sorted.length !== this.graph.nodes.size) {
      const nodesOnCycle = new Set(this.graph.nodes.values())
      for (let i = 0; i < sorted.length; ++i) {
        nodesOnCycle.delete(sorted[i])
      }
      return {
        sorted: sorted,
        cycled: Array.from(nodesOnCycle),
        longestPathSize: longestPathSize
      }
    }

    return {
      sorted: sorted,
      cycled: [],
      longestPathSize: longestPathSize
    }
  }

  private getDominantColor(colors: Color[]): Color {
    let max = colors[0]
    let maxIndex = 0

    for (let i=1; i<colors.length; ++i) {
      if (colors[i] > max) {
        maxIndex = i
        max = colors[i]
      }
    }

    return maxIndex
  }

  private danglingNodes(incomingEdges: Map<Vertex, number>): Vertex[] {
    const result: Vertex[] = []
    incomingEdges.forEach((currentCount, targetNode) => {
      if (currentCount === 0) {
        result.push(targetNode)
      }
    })
    return result
  }

  private colorNodes(nodes: Vertex[]): Vertex[] {
    let currentColor = 0
    nodes.forEach(node => node.color = (++currentColor) % this.numberOfWorkers)
    return nodes
  }

  private initDominantColors(): Map<Vertex, Color[]> {
    const result = new Map()
    this.graph.getNodes().forEach((node) => {
      result.set(node, new Int32Array(this.numberOfWorkers))
    })
    return result
  }

  private incomingEdges(): Map<Vertex, number> {
    const incomingEdges: Map<Vertex, number> = new Map()
    this.graph.getNodes().forEach((node) => (incomingEdges.set(node, 0)))
    this.graph.getEdges().forEach((adjacentNodes, sourceNode) => {
      adjacentNodes.forEach((targetNode) => {
        incomingEdges.set(targetNode, incomingEdges.get(targetNode)! + 1)
      })
    })
    return incomingEdges
  }
}

export type Color = number

export type WorkerInitPayload = {
  type: "INIT",
  nodes: Vertex[],
  edges: Int32Array,
  addressMapping: Int32Array,
  sheetWidth: number,
  sheetHeight: number,
  color: number,
  numberOfWorkers: number,
}

export interface WorkerStartPayload {
  type: "START"
}

