export class Graph {
    constructor(squares) {
        this.squares = squares;
        this.V = squares.length;
        this.dist_s = new Array(this.V).fill(Infinity);
        this.dist_t = new Array(this.V).fill(Infinity);
        this.visited_s = new Array(this.V).fill(false);
        this.visited_t = new Array(this.V).fill(false);
        this.adj = new Array(this.V).fill().map(() => []);

        // Создаем список смежности с учетом весов
        for (let i = 0; i < this.V; i++) {
            const { neighbors } = this.squares[i];
            for (const neighbor of neighbors) {
                const diagonal = Math.abs(this.squares[i].x - neighbor.x) > 0 && Math.abs(this.squares[i].y - neighbor.y) > 0
                if (neighbor.passability < 99)
                    this.adj[i].push({ vertex: neighbor.id, cost: neighbor.passability + (diagonal ? .5 : 0) });
            }
        }
    }

    pathfind() {
        for (;;) {
            let flag = 0;
            for (const dir of [0, 1]) {
                const dist = this[dir ? 'dist_t' : 'dist_s'];
                const visited = this[dir ? 'visited_t' : 'visited_s'];
                const other_visited = this[dir ? 'visited_s' : 'visited_t'];
                let minDist = Infinity, current = null;
                for (let i = 0; i < this.V; i++) {
                    if (!visited[i] && dist[i] < minDist) {
                        minDist = dist[i];
                        current = i;
                    }
                }
                // console.log(dir, 'cur', current)
                if (current == null)
                    continue
                if (other_visited[current]) {
                    return current;
                }
                flag += 1;
                for (const { vertex, cost } of this.adj[current]) {
                    visited[current] = true;
                    const dst = dist[current] + cost;
                    if (dst < dist[vertex])
                        dist[vertex] = dst;
                }
            }
            if (flag < 2)
                return null;
        }
    }

    findCheapestNeighbor(id, adist) {
        let minDist = Infinity, current = null;
        for (const { vertex } of this.adj[id]) {
            if (adist[vertex] < minDist) {
                minDist = adist[vertex];
                current = vertex;
            }
        }
        return current;
    }

    // Print the path from source 's' to target 't' through the intersection node.
    printPath(s, t, intersect) {
        const path = [];
        let i = intersect;
        while (i !== s) {
            path.push(i);
            i = this.findCheapestNeighbor(i, this.dist_s);
            if (i == null)
                return null
        }
        path.push(s);
        path.reverse();
        i = this.findCheapestNeighbor(intersect, this.dist_t);
        while (i !== t) {
            path.push(i);
            i = this.findCheapestNeighbor(i, this.dist_t);
            if (i == null)
                return null
        }
        path.push(t);
        return path;
    }

    // Bidirectional search to find the shortest path between 's' and 't'.
    biDirSearch(s, t) {
        this.dist_s[s] = 0;
        this.dist_t[t] = 0;
        if (this.squares[s].passability >= 99 || this.squares[t].passability >= 99)
            return null;

        // Continue BFS until an intersection is found or both searches are exhausted.
        const intersect = this.pathfind()
        if (intersect != null) {
            console.log(`Intersection found at node: ${intersect}`);
            const path = this.printPath(s, t, intersect);
            console.log("Path:", path?.join(' '));
            return path;
        }
        console.log(this)
        console.log(`Path does not exist between ${s} and ${t}`);
        return null;
    }
}


export const getNeighbors = (squares, square) => {
    const neighbors = [];

    for (const otherSquare of squares) {
        if (square.x === otherSquare.x && square.y === otherSquare.y)
            continue
        if (areAdjacentSquares(square, otherSquare))
            neighbors.push(otherSquare);
    }

    return neighbors;
};

const areAdjacentSquares = (square1, square2) => {
    // Проверяем, соседние ли квадраты
    const xDistance = Math.abs(square1.x - square2.x);
    const yDistance = Math.abs(square1.y - square2.y);

    return xDistance <= square1.size && yDistance <= square1.size;
};






