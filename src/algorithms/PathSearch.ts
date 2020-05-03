import {Vec2Like} from "../math/Geometry";

export interface ISearchGraph<T> {

    data: T[][];
    GetAdjacent(node: SearchNode): SearchNode[];
}

export abstract class SearchNode {

    parent: SearchNode | null;
    position: Vec2Like;
    visited: boolean = false;

    abstract CheckValid(): boolean;
};

export function GetPath<T extends SearchNode>(node: T, pathInOut: Vec2Like[] = []): Vec2Like[] {

    if(node) {
        pathInOut.push(node.position);
        if(node.parent) {
            GetPath(node.parent, pathInOut);
        }
    }
    return pathInOut;
}

export function FindShortestPath<T extends SearchNode>(graph: ISearchGraph<T>, start: Vec2Like, end: Vec2Like): Vec2Like[] | null {

    const search = BredthFirstSearch(graph, start, end);
    if(search) {
        return GetPath(search).reverse();
    }
    return null;
}

export function FindClosestNode<T extends SearchNode>(graph: ISearchGraph<T>, position: Vec2Like, nodes: T[]): T | null {

    let shortest = Number.MAX_VALUE;
    const closest = nodes.find(node => {
        const search = BredthFirstSearch(graph, position, node.position);
        if(search) {
            const path = GetPath(search);
            shortest = Math.min(path.length, shortest);
            return path.length === shortest;
        }
    });
    return closest ? closest : null;
}

export function BredthFirstSearch<T extends SearchNode>(graph: ISearchGraph<T>, start: Vec2Like, end: Vec2Like): SearchNode | null {

    ResetGraph<T>(graph);

    const queue: SearchNode[] = [];
    const begin = graph.data[start.y][start.x];
    begin.visited = true;
    queue.push(begin);

    const target = graph.data[end.y][end.x];

    while (queue.length) {
        const current = queue.shift();
        if(current) {
            if(current.position.x === target.position.x && current.position.y === target.position.y) {
                return current;
            }
            const edges = graph.GetAdjacent(current);
            edges.forEach(edge => {
                if (edge.CheckValid() && !edge.visited) {
                    edge.visited = true;
                    edge.parent = current;
                    queue.push(edge)
                }
            });
        }
    }

    return null;
}

function ResetGraph<T extends SearchNode>(graph: ISearchGraph<T>): void {

    graph.data.forEach(t => t.forEach(node => {
        node.parent = null;
        node.visited = false;
    }));
}