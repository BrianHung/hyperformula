/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
// node status life cycle: undefined -> ON_STACK -> PROCESSED -> POPPED
var NodeVisitStatus;
(function (NodeVisitStatus) {
  NodeVisitStatus[NodeVisitStatus["ON_STACK"] = 0] = "ON_STACK";
  NodeVisitStatus[NodeVisitStatus["PROCESSED"] = 1] = "PROCESSED";
  NodeVisitStatus[NodeVisitStatus["POPPED"] = 2] = "POPPED";
})(NodeVisitStatus || (NodeVisitStatus = {}));
/**
 * An algorithm class. Provides an iterative implementation of Tarjan's algorithm for finding strongly connected components
 */
export class TopSort {
  constructor(nodesSparseArray = [], edgesSparseArray = []) {
    this.nodesSparseArray = nodesSparseArray;
    this.edgesSparseArray = edgesSparseArray;
    this.entranceTime = [];
    this.low = [];
    this.parent = [];
    this.inSCC = [];
    this.nodeStatus = [];
    this.order = [];
    this.sccNonSingletons = [];
    this.timeCounter = 0;
  }
  /**
   * An iterative implementation of Tarjan's algorithm for finding strongly connected components.
   * Returns vertices in order of topological sort, but vertices that are on cycles are kept separate.
   *
   * @param modifiedNodes - seed for computation. During engine init run, all of the vertices of grap. In recomputation run, changed vertices.
   * @param operatingFunction - recomputes value of a node, and returns whether a change occured
   * @param onCycle - action to be performed when node is on cycle
   */
  getTopSortedWithSccSubgraphFrom(modifiedNodeIds, operatingFunction, onCycle) {
    const modifiedNodeIdsReversed = modifiedNodeIds.reverse();
    modifiedNodeIdsReversed.forEach(id => this.runDFS(id));
    return this.postprocess(modifiedNodeIdsReversed, onCycle, operatingFunction);
  }
  /**
   * Returns adjacent nodes of a given node.
   */
  getAdjacentNodeIds(id) {
    return this.edgesSparseArray[id].filter(adjacentId => adjacentId !== undefined && this.nodesSparseArray[adjacentId]);
  }
  /**
   * Runs DFS starting from a given node.
   */
  runDFS(v) {
    if (this.nodeStatus[v] !== undefined) {
      return;
    }
    this.nodeStatus[v] = NodeVisitStatus.ON_STACK;
    const DFSstack = [v];
    const SCCstack = [];
    while (DFSstack.length > 0) {
      const u = DFSstack[DFSstack.length - 1];
      switch (this.nodeStatus[u]) {
        case NodeVisitStatus.ON_STACK:
          {
            this.handleOnStack(u, SCCstack, DFSstack);
            break;
          }
        case NodeVisitStatus.PROCESSED:
          {
            // leaving this DFS subtree
            this.handleProcessed(u, SCCstack, DFSstack);
            break;
          }
        case NodeVisitStatus.POPPED:
          {
            // it's a 'shadow' copy, we already processed this vertex and can ignore it
            DFSstack.pop();
            break;
          }
      }
    }
  }
  /**
   * Handles a node that is on stack.
   */
  handleOnStack(u, SCCstack, DFSstack) {
    this.entranceTime[u] = this.timeCounter;
    this.low[u] = this.timeCounter;
    this.timeCounter++;
    SCCstack.push(u);
    this.getAdjacentNodeIds(u).forEach(t => {
      if (this.entranceTime[t] === undefined) {
        DFSstack.push(t);
        this.parent[t] = u;
        this.nodeStatus[t] = NodeVisitStatus.ON_STACK;
      }
    });
    this.nodeStatus[u] = NodeVisitStatus.PROCESSED;
  }
  /**
   * Handles a node that is already processed.
   */
  handleProcessed(u, SCCstack, DFSstack) {
    let uLow = this.entranceTime[u];
    this.getAdjacentNodeIds(u).forEach(t => {
      if (this.inSCC[t]) {
        return;
      }
      uLow = this.parent[t] === u ? Math.min(uLow, this.low[t]) : Math.min(uLow, this.entranceTime[t]);
    });
    this.low[u] = uLow;
    if (uLow === this.entranceTime[u]) {
      const currentSCC = [];
      do {
        currentSCC.push(SCCstack[SCCstack.length - 1]);
        SCCstack.pop();
      } while (currentSCC[currentSCC.length - 1] !== u);
      currentSCC.forEach(t => {
        this.inSCC[t] = true;
      });
      this.order.push(...currentSCC);
      if (currentSCC.length > 1) {
        currentSCC.forEach(t => {
          this.sccNonSingletons[t] = true;
        });
      }
    }
    DFSstack.pop();
    this.nodeStatus[u] = NodeVisitStatus.POPPED;
  }
  /**
   * Postprocesses the result of Tarjan's algorithm.
   */
  postprocess(modifiedNodeIds, onCycle, operatingFunction) {
    const shouldBeUpdatedMapping = [];
    modifiedNodeIds.forEach(t => {
      shouldBeUpdatedMapping[t] = true;
    });
    const sorted = [];
    const cycled = [];
    this.order.reverse();
    this.order.forEach(t => {
      const adjacentNodes = this.getAdjacentNodeIds(t);
      // The following line is a potential performance bottleneck.
      // Array.includes() is O(n) operation, which makes the whole algorithm O(n^2).
      // Idea for improvement: use Set<T>[] instead of number[][] for edgesSparseArray.
      if (this.sccNonSingletons[t] || adjacentNodes.includes(t)) {
        cycled.push(this.nodesSparseArray[t]);
        onCycle(this.nodesSparseArray[t]);
        adjacentNodes.forEach(s => shouldBeUpdatedMapping[s] = true);
      } else {
        sorted.push(this.nodesSparseArray[t]);
        if (shouldBeUpdatedMapping[t] && operatingFunction(this.nodesSparseArray[t])) {
          adjacentNodes.forEach(s => shouldBeUpdatedMapping[s] = true);
        }
      }
    });
    return {
      sorted,
      cycled
    };
  }
}