import MazerView from "./MazerView";
import MazerData, {MazerCellRef} from "./MazerData";
import MazerExporter from "./MazerExporter";

export default class Mazer {
    public view:MazerView;
    public data:MazerData;
    public exporter:MazerExporter;

    public cellSize:DOMPoint;
    public thickness:DOMPoint;

    constructor(canvas:HTMLCanvasElement) {
        this.cellSize = new DOMPoint();
        this.thickness = new DOMPoint();

        this.setCellSize(50, 50);
        this.setThickness(0.1, 0.1);

        this.data = new MazerData();
        this.data.build(this.thickness);

        this.exporter = new MazerExporter(this.data);

        this.view = new MazerView(canvas, this.data);
        this.view.render(this.cellSize);
    }

    setCellSize(x:number, y:number) {
        this.cellSize.x = x;
        this.cellSize.y = y;
    }

    setThickness(x:number, y:number) {
        this.thickness.x = x;
        this.thickness.y = y;

        this.data && this.data.buildVertices(this.thickness);
    }
}