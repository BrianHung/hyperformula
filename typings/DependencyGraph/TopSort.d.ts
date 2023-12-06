/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
export interface TopSortResult<T> {
    sorted: T[];
    cycled: T[];
}
/**
 * An algorithm class. Provides an iterative implementation of Tarjan's algorithm for finding strongly connected components
 */
export declare class TopSort<T> {
    private nodesSparseArray;
    private edgesSparseArray;
    private entranceTime;
    private low;
    private parent;
    private inSCC;
    private nodeStatus;
    private order;
    private sccNonSingletons;
    private timeCounter;
    constructor(nodesSparseArray?: T[], edgesSparseArray?: number[][]);
    /**
     * An iterative implementation of Tarjan's algorithm for finding strongly connected components.
     * Returns vertices in order of topological sort, but vertices that are on cycles are kept separate.
     *
     * @param modifiedNodes - seed for computation. During engine init run, all of the vertices of grap. In recomputation run, changed vertices.
     * @param operatingFunction - recomputes value of a node, and returns whether a change occured
     * @param onCycle - action to be performed when node is on cycle
     */
    getTopSortedWithSccSubgraphFrom(modifiedNodeIds: number[], operatingFunction: (node: T) => boolean, onCycle: (node: T) => void): TopSortResult<T>;
    /**
     * Returns adjacent nodes of a given node.
     */
    private getAdjacentNodeIds;
    /**
     * Runs DFS starting from a given node.
     */
    private runDFS;
    /**
     * Handles a node that is on stack.
     */
    private handleOnStack;
    /**
     * Handles a node that is already processed.
     */
    private handleProcessed;
    /**
     * Postprocesses the result of Tarjan's algorithm.
     */
    private postprocess;
}
