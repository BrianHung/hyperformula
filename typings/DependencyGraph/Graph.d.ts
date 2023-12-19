/**
 * @license
 * Copyright (c) 2023 Handsoncode. All rights reserved.
 */
import { SimpleCellAddress } from '../Cell';
import { SimpleCellRange } from '../AbsoluteCellRange';
import { TopSortResult } from './TopSort';
export declare type NodeId = number;
export declare type NodeAndId<Node> = {
    node: Node;
    id: NodeId;
};
export declare type DependencyQuery<Node> = (vertex: Node) => [(SimpleCellAddress | SimpleCellRange), Node][];
/**
 * Provides directed graph structure.
 *
 * Idea for performance improvement:
 * - use Set<Node>[] instead of NodeId[][] for edgesSparseArray
 */
export declare class Graph<Node> {
    private readonly dependencyQuery;
    /**
     * A sparse array. The value nodesSparseArray[n] exists if and only if node n is in the graph.
     * @private
     */
    private nodesSparseArray;
    /**
     * A sparse array. The value edgesSparseArray[n] exists if and only if node n is in the graph.
     * The edgesSparseArray[n] is also a sparse array. It may contain removed nodes. To make sure check nodesSparseArray.
     * @private
     */
    private edgesSparseArray;
    /**
     * A mapping from node to its id. The value nodesIds.get(node) exists if and only if node is in the graph.
     * @private
     */
    private nodesIds;
    /**
     * A ProcessableValue object.
     * @private
     */
    private dirtyAndVolatileNodeIds;
    /**
     * A set of node ids. The value infiniteRangeIds.get(nodeId) exists if and only if node is in the graph.
     * @private
     */
    private infiniteRangeIds;
    /**
     * A dense array. It may contain duplicates and removed nodes.
     * @private
     */
    private changingWithStructureNodeIds;
    private nextId;
    constructor(dependencyQuery: DependencyQuery<Node>);
    /**
     * Iterate over all nodes the in graph
     */
    getNodes(): Node[];
    /**
     * Checks whether a node is present in graph
     *
     * @param node - node to check
     */
    hasNode(node: Node): boolean;
    /**
     * Checks whether exists edge between nodes. If one or both of nodes are not present in graph, returns false.
     *
     * @param fromNode - node from which edge is outcoming
     * @param toNode - node to which edge is incoming
     */
    existsEdge(fromNode: Node, toNode: Node): boolean;
    /**
     * Returns nodes adjacent to given node. May contain removed nodes.
     *
     * @param node - node to which adjacent nodes we want to retrieve
     *
     * Idea for performance improvement:
     * - return an array instead of set
     */
    adjacentNodes(node: Node): Set<Node>;
    /**
     * Returns number of nodes adjacent to given node. Contrary to adjacentNodes(), this method returns only nodes that are present in graph.
     *
     * @param node - node to which adjacent nodes we want to retrieve
     */
    adjacentNodesCount(node: Node): number;
    /**
     * Adds node to a graph
     *
     * @param node - a node to be added
     */
    addNodeAndReturnId(node: Node): NodeId;
    /**
     * Adds edge between nodes.
     *
     * The nodes had to be added to the graph before, or the error will be raised
     *
     * @param fromNode - node from which edge is outcoming
     * @param toNode - node to which edge is incoming
     */
    addEdge(fromNode: Node | NodeId, toNode: Node | NodeId): void;
    /**
     * Removes node from graph
     */
    removeNode(node: Node): [(SimpleCellAddress | SimpleCellRange), Node][];
    /**
     * Removes edge between nodes.
     */
    removeEdge(fromNode: Node | NodeId, toNode: Node | NodeId): void;
    /**
     * Removes edge between nodes if it exists.
     */
    removeEdgeIfExists(fromNode: Node, toNode: Node): void;
    /**
     * Sorts the whole graph topologically. Nodes that are on cycles are kept separate.
     */
    topSortWithScc(): TopSortResult<Node>;
    /**
     * Sorts the graph topologically. Nodes that are on cycles are kept separate.
     *
     * @param modifiedNodes - seed for computation. The algorithm assumes that only these nodes have changed since the last run.
     * @param operatingFunction - recomputes value of a node, and returns whether a change occurred
     * @param onCycle - action to be performed when node is on cycle
     */
    getTopSortedWithSccSubgraphFrom(modifiedNodes: Node[], operatingFunction: (node: Node) => boolean, onCycle: (node: Node) => void): TopSortResult<Node>;
    /**
     * Marks node as volatile.
     */
    markNodeAsVolatile(node: Node): void;
    /**
     * Marks node as dirty.
     */
    markNodeAsDirty(node: Node): void;
    /**
     * Returns an array of nodes that are marked as dirty and/or volatile.
     */
    getDirtyAndVolatileNodes(): Node[];
    /**
     * Clears dirty nodes.
     */
    clearDirtyNodes(): void;
    /**
     * Marks node as changingWithStructure.
     */
    markNodeAsChangingWithStructure(node: Node): void;
    /**
     * Marks all nodes marked as changingWithStructure as dirty.
     */
    markChangingWithStructureNodesAsDirty(): void;
    /**
     * Marks node as infinite range.
     */
    markNodeAsInfiniteRange(node: Node | NodeId): void;
    /**
     * Returns an array of nodes marked as infinite ranges
     */
    getInfiniteRanges(): NodeAndId<Node>[];
    /**
     * Returns the internal id of a node.
     */
    getNodeId(node: Node): NodeId | undefined;
    /**
     *
     */
    private getNodeIdIfNotNumber;
    /**
     * Removes invalid neighbors of a given node from the edges array and returns adjacent nodes for the input node.
     */
    private fixEdgesArrayForNode;
    /**
     * Removes edges from the given node to its dependencies based on the dependencyQuery function.
     */
    private removeDependencies;
    /**
     * processFn for dirtyAndVolatileNodeIds ProcessableValue instance
     * @private
     */
    private processDirtyAndVolatileNodeIds;
    /**
     * Returns error for missing node.
     */
    private missingNodeError;
}