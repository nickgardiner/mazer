export default class MazerView {
    public canvas:HTMLCanvasElement;
    public context:CanvasRenderingContext2D;

    constructor(canvas:HTMLCanvasElement) {
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
}