import Mazer from "./Mazer";

export const MazerCellFlags = {
    AllWalls: 0,
    Up: 1,
    Right: 2,
    Down: 4,
    Left: 8,
    NoWalls: 15,
    Touched: 16,

    oppositeWall: (wall:number) => {
        switch (wall) {
            case MazerCellFlags.Up:
                return MazerCellFlags.Down;

            case MazerCellFlags.Right:
                return MazerCellFlags.Left;

            case MazerCellFlags.Down:
                return MazerCellFlags.Up;

            case MazerCellFlags.Left:
                return MazerCellFlags.Right;

            default:
                throw new Error('oppositeWall: invalid wall');
        }
    }
}

export interface MazerCellRef {
    loc: DOMPoint;
    index: number;
}

interface MazerCellMove {
    dir: number;
    cellRef: MazerCellRef;
}

export interface MazerTreeNode {
    cellRef: MazerCellRef;
    parent: MazerTreeNode|null;
    child: Array<MazerTreeNode>;
}

export default class MazerData {
    public size:DOMPoint = new DOMPoint(5, 5);

    public data:Uint8Array = new Uint8Array();
    protected current:MazerCellRef = {loc:new DOMPoint(), index:0};
    protected dirty:boolean = true;

    public tree:MazerTreeNode = {cellRef:this.current, parent:null, child:[]};
    protected treeNode:Array<MazerTreeNode> = [];
    protected currentNode:MazerTreeNode = this.tree;

    public vertices:DOMPoint[] = [];

    clearData() {
        this.data = new Uint8Array(this.size.x * this.size.y);
        this.current = {loc:new DOMPoint(), index:0};
        this.dirty = false;

        this.tree = {cellRef:this.current, parent:null, child:[]};
        this.treeNode[this.tree.cellRef.index] = this.tree;
        this.currentNode = this.tree;

        this.vertices = [];
    }

    build(thickness:DOMPoint): void {
        if (this.dirty) {
            this.clearData();
        }

        this.processPath();
        this.buildVertices(thickness);

        this.dirty = true;
    }

    processPath() {
        let moves;

        while (true) {
            this.data[this.current.index] |= MazerCellFlags.Touched;

            moves = this.getAvailableMoves(this.current);
            if (moves.length === 0) {
                const start = this.findPathStart();
                if (start) {
                    this.currentNode = this.treeNode[start.index];
                    this.current = start;
                    continue;
                }
                break;
            }

            const move = moves[Math.floor(Math.random() * moves.length)];

            this.data[this.current.index] |= move.dir;
            this.data[move.cellRef.index] |= MazerCellFlags.oppositeWall(move.dir);

            const newNode:MazerTreeNode = {
                cellRef: move.cellRef,
                parent: this.currentNode,
                child:[]
            };
            this.treeNode[newNode.cellRef.index] = newNode;
            this.currentNode.child.push(newNode);
            this.currentNode = newNode;

            this.current = move.cellRef;
        }
    }

    findPathStart(): MazerCellRef|null {
        const start:Array<MazerCellRef> = [];

        for (let i = 0; i < this.size.y; i++) {
            for (let j = 0; j < this.size.x; j++) {
                let cellRef:MazerCellRef = {
                    loc: new DOMPoint(j, i),
                    index: i * this.size.x + j
                };

                if (
                    this.data[cellRef.index] & MazerCellFlags.Touched
                    && this.hasAvailableMoves(cellRef)
                ) {
                    start.push(cellRef);
                }
            }
        }

        return start.length > 0
            ? start[Math.floor(Math.random() * start.length)]
            : null;
    }

    hasAvailableMoves(cellRef:MazerCellRef): boolean {
        return this.canMoveUp(cellRef)
            || this.canMoveRight(cellRef)
            || this.canMoveDown(cellRef)
            || this.canMoveLeft(cellRef);
    }

    getAvailableMoves(cellRef:MazerCellRef): Array<MazerCellMove> {
        const moves:Array<MazerCellMove> = [];

        if (this.canMoveUp(cellRef)) {
            moves.push({
                dir: MazerCellFlags.Up,
                cellRef: {
                    loc: new DOMPoint(cellRef.loc.x, cellRef.loc.y - 1),
                    index: cellRef.index - this.size.x
                }
            });
        }

        if (this.canMoveLeft(cellRef)) {
            moves.push({
                dir: MazerCellFlags.Left,
                cellRef: {
                    loc: new DOMPoint(cellRef.loc.x - 1, cellRef.loc.y),
                    index: cellRef.index - 1
                }
            });
        }

        if (this.canMoveDown(cellRef)) {
            moves.push({
                dir: MazerCellFlags.Down,
                cellRef: {
                    loc: new DOMPoint(cellRef.loc.x, cellRef.loc.y + 1),
                    index: cellRef.index + this.size.x
                }
            });
        }

        if (this.canMoveRight(cellRef)) {
            moves.push({
                dir: MazerCellFlags.Right,
                cellRef: {
                    loc: new DOMPoint(cellRef.loc.x + 1, cellRef.loc.y),
                    index: cellRef.index + 1
                }
            });
        }

        return moves;
    }

    canMoveUp(cellRef:MazerCellRef): boolean {
        return cellRef.loc.y > 0
            && !(this.data[cellRef.index] & MazerCellFlags.Up)
            && !(this.data[cellRef.index - this.size.x] & MazerCellFlags.Touched);
    }

    canMoveRight(cellRef:MazerCellRef): boolean {
        return cellRef.loc.x < this.size.x - 1
            && !(this.data[cellRef.index] & MazerCellFlags.Right)
            && !(this.data[cellRef.index + 1] & MazerCellFlags.Touched);
    }

    canMoveDown(cellRef:MazerCellRef): boolean {
        return cellRef.loc.y < this.size.y - 1
            && !(this.data[cellRef.index] & MazerCellFlags.Down)
            && !(this.data[cellRef.index + this.size.x] & MazerCellFlags.Touched);
    }

    canMoveLeft(cellRef:MazerCellRef): boolean {
        return cellRef.loc.x > 0
            && !(this.data[cellRef.index] & MazerCellFlags.Left)
            && !(this.data[cellRef.index - 1] & MazerCellFlags.Touched);
    }

    buildVertices(thickness:DOMPoint): void {
        const cell = new DOMPoint()
        this.vertices = [
            DOMPoint.fromPoint(thickness)
        ];

        let cursor = DOMPoint.fromPoint(this.vertices[0]);
        let dir = MazerCellFlags.Right;

        while (true) {
            let cellRect = this.getCellRect(cell, thickness);
            let index = cell.y * this.size.x + cell.x;

            switch (dir) {
                case MazerCellFlags.Right:
                    // process top wall
                    if (!(this.data[index] & MazerCellFlags.Right)) {
                        // has right wall
                        cursor.x = cellRect.right;
                        dir = MazerCellFlags.Down;
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.x = cellRect.right + thickness.x * 2;
                    cell.x++;

                    if (this.data[index + 1] & MazerCellFlags.Up) {
                        // right cell does not have top wall
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Up;
                    }
                    break;

                case MazerCellFlags.Down:
                    // process right wall
                    if (!(this.data[index] & MazerCellFlags.Down)) {
                        // has bottom wall
                        cursor.y = cellRect.bottom;
                        dir = MazerCellFlags.Left;
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.y = cellRect.bottom + thickness.y * 2;
                    cell.y++;

                    if (this.data[index + this.size.x] & MazerCellFlags.Right) {
                        // bottom cell does not have right wall
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Right;
                    }
                    break;

                case MazerCellFlags.Left:
                    // process bottom wall
                    if (!(this.data[index] & MazerCellFlags.Left)) {
                        // has left wall
                        cursor.x = cellRect.left;
                        dir = MazerCellFlags.Up;
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.x = cellRect.left - thickness.x * 2;
                    cell.x--;

                    if (this.data[index - 1] & MazerCellFlags.Down) {
                        // left cell does not have bottom wall
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Down;
                    }
                    break;

                case MazerCellFlags.Up:
                    // process left wall
                    if (!(this.data[index] & MazerCellFlags.Up)) {
                        // has top wall
                        cursor.y = cellRect.top;
                        dir = MazerCellFlags.Right;
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.y = cellRect.top - thickness.y * 2;
                    cell.y--;

                    if (this.data[index - this.size.x] & MazerCellFlags.Left) {
                        // top cell does not have left wall
                        this.vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Left;
                    }
                    break;
            }

            if (cell.x === 0 && cell.y === 0 && dir === MazerCellFlags.Up) {
                break;
            }
        }
    }

    getCellRect(cell:DOMPoint, thickness?:DOMPoint): DOMRect {
        thickness = thickness || new DOMPoint();

        return new DOMRect(
            cell.x + thickness.x,
            cell.y + thickness.y,
            1 - thickness.x * 2,
            1 - thickness.y * 2
        );
    }

    getTreePath(startIndex:number, endIndex:number): Array<MazerCellRef> {
        if (startIndex === endIndex) {
            return [];
        }

        const startPath = this.getTreePathRootToNodeIndex(startIndex);
        const endPath = this.getTreePathRootToNodeIndex(endIndex);
        let common = null;

        while (
            startPath.length > 0
            && endPath.length > 0
            && startPath[0].index === endPath[0].index
        ) {
            common = startPath[0];
            startPath.shift();
            endPath.shift();
        }

        startPath.reverse();

        let path:Array<MazerCellRef> = [];
        path = path.concat(startPath);
        common && path.push(common);
        path = path.concat(endPath);

        return path;
    }

    getTreePathRootToNodeIndex(nodeIndex:number): Array<MazerCellRef> {
        let node:MazerTreeNode|null = this.treeNode[nodeIndex];
        const path = [];

        while (node) {
            path.unshift(node.cellRef);
            node = node.parent;
        }

        return path;
    }

    locToIndex(x:number, y:number): number {
        return y * this.size.x + x;
    }

    getLongestTreePath(): any {
        const longestPath = {
            length: 0,
            treePath: [] as Array<MazerCellRef>[]
        };

        for (let i = 0; i < this.data.length; i++) {
            for (let j = i + 1; j < this.data.length; j++) {
                let treePath = this.getTreePath(i, j);
                if (treePath.length < longestPath.length) {
                    continue;
                }

                if (treePath.length > longestPath.length) {
                    longestPath.length = treePath.length;
                    longestPath.treePath = [];
                }

                longestPath.treePath.push(treePath);
            }
        }

        return longestPath;
    }
}