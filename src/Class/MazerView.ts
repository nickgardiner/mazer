import MazerData, {MazerCellRef, MazerTreeNode} from "./MazerData";

export default class MazerView {
    public canvas:HTMLCanvasElement;
    public context:CanvasRenderingContext2D;
    protected data: MazerData;

    constructor(canvas:HTMLCanvasElement, data:MazerData) {
        this.data = data;
        this.canvas = canvas;

        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('unable to get context');
        }
        this.context = context;
    }

    fill(style?:string|CanvasGradient|CanvasPattern): void {
        this.context.fillStyle = style || 'black';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize(): boolean {
        const rect = this.canvas.parentElement!.getBoundingClientRect();

        if (
            this.canvas.width === rect.width
            && this.canvas.height === rect.height
        ) {
            return false;
        }

        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        return true;
    }

    render(cellSize:DOMPoint): void {
        this.canvas.width = this.data.size.x * cellSize.x + 1;
        this.canvas.height = this.data.size.y * cellSize.y + 1;

        this.fill('#2f3334');

        this.renderGrid(cellSize);
        this.renderVertices(this.data.vertices, cellSize);
        this.renderTree(cellSize);

        // const longestTreePath = this.data.getLongestTreePath();
        // const treePath = longestTreePath.treePath[Math.floor(Math.random() * longestTreePath.treePath.length)];
        // this.renderTreePath(treePath, cellSize);
    }

    renderGrid(cellSize:DOMPoint): void {
        this.context.beginPath();

        for (let i = 0; i <= this.data.size.x; i++) {
            this.context.moveTo(i * cellSize.x + 0.5, 0.5);
            this.context.lineTo(i * cellSize.x + 0.5, this.data.size.y * cellSize.y + 0.5);
        }

        for (let i = 0; i <= this.data.size.y; i++) {
            this.context.moveTo(0.5, i * cellSize.y + 0.5);
            this.context.lineTo(this.data.size.x * cellSize.x + 0.5, i * cellSize.y + 0.5);
        }

        this.context.strokeStyle = '#54575b';
        this.context.stroke();
    }

    renderVertices(vertices:DOMPoint[], cellSize:DOMPoint): void {
        this.context.beginPath();

        for (let i = 0; i < vertices.length; i++) {
            if (i === 0) {
                this.context.moveTo(vertices[i].x * cellSize.x + 0.5, vertices[i].y * cellSize.y + 0.5);
            } else {
                this.context.lineTo(vertices[i].x * cellSize.x + 0.5, vertices[i].y * cellSize.y + 0.5);
            }
        }

        this.context.closePath();
        this.context.strokeStyle = 'white';
        this.context.stroke();
    }

    renderTree(cellSize:DOMPoint): void {
        const path = new Path2D();
        let startNodes = [...this.data.tree.child];

        while (startNodes.length > 0) {
            let node = startNodes.shift();
            if (!node) {
                continue;
            }

            let stopNode = this.buildTreePath(node, cellSize, path);
            if (stopNode && stopNode.child.length > 1) {
                startNodes = startNodes.concat(stopNode.child);
            }
        }

        this.context.strokeStyle = 'rgba(0,255,255,0.2)';
        this.context.stroke(path);
    }

    buildTreePath(node:MazerTreeNode, cellSize:DOMPoint, path:Path2D): MazerTreeNode|null {
        if (!node.parent) {
            return null;
        }

        let cellRect = this.data.getCellRect(
            new DOMPoint(
                node.parent.cellRef.loc.x,
                node.parent.cellRef.loc.y
            )
        );
        path.moveTo(
            cellRect.left * cellSize.x + cellRect.width * cellSize.x * 0.5 + 0.5,
            cellRect.top * cellSize.y + cellRect.height * cellSize.y * 0.5 + 0.5
        );

        while (true) {
            cellRect = this.data.getCellRect(
                new DOMPoint(
                    node.cellRef.loc.x,
                    node.cellRef.loc.y
                )
            );
            path.lineTo(
                cellRect.left * cellSize.x + cellRect.width * cellSize.x * 0.5 + 0.5,
                cellRect.top * cellSize.y + cellRect.height * cellSize.y * 0.5 + 0.5
            );

            if (node.child.length !== 1) {
                break;
            }

            node = node.child[0];
        }

        return node;
    }

    renderTreePath(treePath:Array<MazerCellRef>, cellSize:DOMPoint): void {
        const path = new Path2D();

        for (let i = 0; i < treePath.length; i++) {
            let cellRect = this.data.getCellRect(
                new DOMPoint(
                    treePath[i].loc.x,
                    treePath[i].loc.y
                )
            );

            let x = cellRect.left * cellSize.x + cellRect.width * cellSize.x * 0.5 + 0.5;
            let y = cellRect.top * cellSize.y + cellRect.height * cellSize.y * 0.5 + 0.5;

            if (i === 0) {
                path.moveTo(x, y);
            } else {
                path.lineTo(x, y);
            }
        }

        this.context.strokeStyle = '#00ff00';
        this.context.stroke(path);
    }
}