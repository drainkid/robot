export class Graph {
    constructor(squares) {
        this.squares = squares;
        this.V = squares.length;
        this.adj = new Array(this.V).fill().map(() => []);

        // Создаем список смежности с учетом весов
        for (let i = 0; i < this.V; i++) {
            const { neighbors } = this.squares[i];
            for (const neighbor of neighbors) {
                this.adj[i].push({ vertex: neighbor.id, weight: neighbor.passability });
            }
        }
    }

    // Breadth-First Search (BFS) starting from a given source node.
    BFS(queue, visited, parent) {
        const current = queue.shift();
        for (const neighbor of this.adj[current]) {
            if (!visited[neighbor.vertex]) {
                parent[neighbor.vertex] = current;
                visited[neighbor.vertex] = true;
                queue.push(neighbor.vertex);
            }
        }
    }

    // Check if there is an intersection between two BFS searches.
    isIntersecting(s_visited, t_visited) {
        for (let i = 0; i < this.V; i++) {
            if (s_visited[i] && t_visited[i]) {
                return i; // Return the intersecting node
            }
        }
        return -1; // No intersection found
    }

    // Print the path from source 's' to target 't' through the intersection node.
    printPath(s_parent, t_parent, s, t, intersectNode) {
        const path = [];
        path.push(intersectNode);
        let i = intersectNode;
        while (i !== s) {
            path.push(s_parent[i]);
            i = s_parent[i];
        }
        path.reverse();
        i = intersectNode;
        while (i !== t) {
            path.push(t_parent[i]);
            i = t_parent[i];
        }
        return path;
    }

    // Bidirectional search to find the shortest path between 's' and 't'.
    biDirSearch(s, t) {
        const s_visited = new Array(this.V).fill(false);
        const t_visited = new Array(this.V).fill(false);
        const s_parent = new Array(this.V).fill(-1);
        const t_parent = new Array(this.V).fill(-1);
        const s_queue = [];
        const t_queue = [];
        let intersectNode = -1;

        // Start BFS from the source node 's'.
        s_queue.push(s);
        s_visited[s] = true;
        s_parent[s] = -1;

        // Start BFS from the target node 't'.
        t_queue.push(t);
        t_visited[t] = true;
        t_parent[t] = -1;

        // Continue BFS until an intersection is found or both searches are exhausted.
        while (s_queue.length > 0 && t_queue.length > 0) {
            this.BFS(s_queue, s_visited, s_parent);
            this.BFS(t_queue, t_visited, t_parent);
            intersectNode = this.isIntersecting(s_visited, t_visited);

            if (intersectNode !== -1) {
                console.log(`Intersection found at node: ${intersectNode}`);
                const path = this.printPath(s_parent, t_parent, s, t, intersectNode);
                console.log("Path:", path.join(' '));
                return path;
            }
        }
        console.log(`Path does not exist between ${s} and ${t}`);
        return null;
    }
}


export const getNeighbors = (squares, square) => {
    const neighbors = [];

    for (const otherSquare of squares) {
        if (square !== otherSquare && areAdjacentSquares(square, otherSquare)) {
            neighbors.push(otherSquare);
        }
    }

    return neighbors;
};

const areAdjacentSquares = (square1, square2) => {
    // Проверяем, соседние ли квадраты
    const xDistance = Math.abs(square1.x - square2.x);
    const yDistance = Math.abs(square1.y - square2.y);

    return xDistance <= square1.size && yDistance <= square1.size;
};






