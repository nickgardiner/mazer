import MazerView from "./MazerView";
import MazerData, {MazerCellFlags} from "./MazerData";
import MazerBuilder from "./MazerBuilder";

export default class Mazer {
    private view:MazerView;
    public data:MazerData;
    public builder:MazerBuilder;
    public cellSize:DOMPoint;
    public thickness:DOMPoint;
    public vertices:DOMPoint[];

    constructor(canvas:HTMLCanvasElement) {
        this.cellSize = new DOMPoint(50, 50);
        this.thickness = new DOMPoint(0.1, 0.1);

        this.data = new MazerData();
        this.view = new MazerView(canvas);
        this.builder = new MazerBuilder(this, this.data);
        this.vertices = [];

        this.render();
    }

    render() {
        const {canvas} = this.view;

        this.vertices = this.builder.buildVertices();

        canvas.width = this.data.size.x * this.cellSize.x + 1;
        canvas.height = this.data.size.y * this.cellSize.y + 1;

        this.view.fill('#2f3334');
        this.renderGrid();
        // this.renderData();
        this.renderVertices();
    }

    renderVertices() {
        const {context} = this.view;

        context.beginPath();

        for (let i = 0; i < this.vertices.length; i++) {
            if (i === 0) {
                context.moveTo(this.vertices[i].x + 0.5, this.vertices[i].y + 0.5);
            } else {
                context.lineTo(this.vertices[i].x + 0.5, this.vertices[i].y + 0.5);
            }
        }

        context.closePath();
        context.strokeStyle = 'white';
        context.stroke();
    }

    renderData() {
        const {context} = this.view;

        const rect = new DOMRect();
        const thickness = new DOMPoint(
            this.cellSize.x * this.thickness.x,
            this.cellSize.y * this.thickness.y
        );

        context.beginPath();

        // let index;
        for (let i = 0; i < this.data.size.y; i++) {
            for (let j = 0; j < this.data.size.x; j++) {
                let index = i * this.data.size.x + j;

                rect.x = j * this.cellSize.x + thickness.x;
                rect.y = i * this.cellSize.y + thickness.y;
                rect.width = this.cellSize.x - thickness.x * 2;
                rect.height = this.cellSize.y - thickness.y * 2;

                if (!(this.data.data[index] & MazerCellFlags.Up)) {
                    context.moveTo(rect.x, rect.y);
                    context.lineTo(rect.right, rect.y);
                }

                if (!(this.data.data[index] & MazerCellFlags.Right)) {
                    context.moveTo(rect.right, rect.y);
                    context.lineTo(rect.right, rect.bottom);
                }

                if (!(this.data.data[index] & MazerCellFlags.Down)) {
                    context.moveTo(rect.right, rect.bottom);
                    context.lineTo(rect.x, rect.bottom);
                }

                if (!(this.data.data[index] & MazerCellFlags.Left)) {
                    context.moveTo(rect.x, rect.bottom);
                    context.lineTo(rect.x, rect.y);
                }
            }
        }

        context.strokeStyle = 'rgba(255,255,255,0.3)';//'white';
        context.stroke();
    }

    renderGrid() {
        const {context} = this.view;

        context.beginPath();

        for (let i = 0; i <= this.data.size.x; i++) {
            context.moveTo(i * this.cellSize.x + 0.5, 0 + 0.5);
            context.lineTo(i * this.cellSize.x + 0.5, this.data.size.y * this.cellSize.y + 0.5);
        }

        for (let i = 0; i <= this.data.size.y; i++) {
            context.moveTo(0 + 0.5, i * this.cellSize.y + 0.5);
            context.lineTo(this.data.size.x * this.cellSize.x + 0.5, i * this.cellSize.y + 0.5);
        }

        context.strokeStyle = '#54575b';
        context.stroke();
    }
}