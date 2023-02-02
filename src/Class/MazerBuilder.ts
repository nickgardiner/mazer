import Mazer from "./Mazer";
import MazerData, {MazerCellFlags} from "./MazerData";

export default class MazerBuilder {
    protected mazer:Mazer;
    protected data:MazerData;

    constructor(mazer:Mazer, data:MazerData) {
        this.mazer = mazer;
        this.data = data;
    }

    buildVertices(): DOMPoint[] {
        const cell = new DOMPoint()
        const thickness = new DOMPoint(
            this.mazer.cellSize.x * this.mazer.thickness.x,
            this.mazer.cellSize.y * this.mazer.thickness.y
        );
        const vertices:DOMPoint[] = [
            new DOMPoint(thickness.x, thickness.y)
        ];

        let cursor = DOMPoint.fromPoint(vertices[0]);
        let dir = MazerCellFlags.Right;

        while (true) {
            let cellRect = this.getCellRect(cell, thickness);
            let index = cell.y * this.data.size.x + cell.x;

            switch (dir) {
                case MazerCellFlags.Right:
                    // process top wall
                    if (!(this.data.data[index] & MazerCellFlags.Right)) {
                        // has right wall
                        cursor.x = cellRect.right;
                        dir = MazerCellFlags.Down;
                        vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.x = cellRect.right + thickness.x * 2;
                    cell.x++;

                    if (this.data.data[index + 1] & MazerCellFlags.Up) {
                        // right cell does not have top wall
                        vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Up;
                    }
                    break;

                case MazerCellFlags.Down:
                    // process right wall
                    if (!(this.data.data[index] & MazerCellFlags.Down)) {
                        // has bottom wall
                        cursor.y = cellRect.bottom;
                        dir = MazerCellFlags.Left;
                        vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.y = cellRect.bottom + thickness.y * 2;
                    cell.y++;

                    if (this.data.data[index + this.data.size.x] & MazerCellFlags.Right) {
                        // bottom cell does not have right wall
                        vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Right;
                    }
                    break;

                case MazerCellFlags.Left:
                    // process bottom wall
                    if (!(this.data.data[index] & MazerCellFlags.Left)) {
                        // has left wall
                        cursor.x = cellRect.left;
                        dir = MazerCellFlags.Up;
                        vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.x = cellRect.left - thickness.x * 2;
                    cell.x--;

                    if (this.data.data[index - 1] & MazerCellFlags.Down) {
                        // left cell does not have bottom wall
                        vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Down;
                    }
                    break;

                case MazerCellFlags.Up:
                    // process left wall
                    if (!(this.data.data[index] & MazerCellFlags.Up)) {
                        // has top wall
                        cursor.y = cellRect.top;
                        dir = MazerCellFlags.Right;
                        vertices.push(DOMPoint.fromPoint(cursor));
                        break;
                    }

                    cursor.y = cellRect.top - thickness.y * 2;
                    cell.y--;

                    if (this.data.data[index - this.data.size.x] & MazerCellFlags.Left) {
                        // top cell does not have left wall
                        vertices.push(DOMPoint.fromPoint(cursor));
                        dir = MazerCellFlags.Left;
                    }
                    break;
            }

            if (cell.x === 0 && cell.y === 0 && dir === MazerCellFlags.Up) {
                break;
            }
        }

        return vertices;
    }

    getCellRect(cell:DOMPoint, thickness:DOMPoint): DOMRect {
        return new DOMRect(
            cell.x * this.mazer.cellSize.x + thickness.x,
            cell.y * this.mazer.cellSize.y + thickness.y,
            this.mazer.cellSize.x - thickness.x * 2,
            this.mazer.cellSize.y - thickness.y * 2
        );
    }

    getWavefrontObjExport(mazer:Mazer) {
        const vertices = this.getWavefrontObjVertices();

        return [
            '# Mazer 1.0 OBJ Exporter\n#\n',
            vertices.join('\n') + '\n',
            this.getWavefrontMazeObj(mazer).join('\n') + '\n',
            this.getWavefrontMazeBoxObj(mazer).join('\n')
        ].join('\n');
    }

    getWavefrontObjVertices(): string[] {
        const {vertices} = this.mazer;
        const thickness = new DOMPoint(
            this.mazer.cellSize.x * this.mazer.thickness.x,
            this.mazer.cellSize.y * this.mazer.thickness.y
        );
        const w = this.mazer.data.size.x * this.mazer.cellSize.x + thickness.x * 2;
        const h = this.mazer.data.size.y * this.mazer.cellSize.y + thickness.y * 2;
        const l = w * -0.5;
        const t = h * -0.5;
        const r = l + w;
        const b = t + h;

        const rect = {
            l: l.toFixed(4),
            t: t.toFixed(4),
            r: r.toFixed(4),
            b: b.toFixed(4)
        }

        // const w = (mazer.data.size.x * mazer.cellSize.x).toFixed(4);
        // const h = (mazer.data.size.y * mazer.cellSize.y).toFixed(4);
        const v = [];

        for (let i = 0; i < vertices.length; i ++) {
            let x = (vertices[i].x + l + thickness.x).toFixed(4);
            let y = vertices[i].z.toFixed(4);
            let z = (vertices[i].y + t + thickness.y).toFixed(4);

            v.push(`v  ${x} ${y} ${z}`);
        }

        return v.concat([
            `v  ${rect.l} 0.0000 ${rect.t}`,
            `v  ${rect.r} 0.0000 ${rect.t}`,
            `v  ${rect.r} 0.0000 ${rect.b}`,
            `v  ${rect.l} 0.0000 ${rect.b}`
        ]);
    }

    getWavefrontMazeObj(mazer:Mazer): string[] {
        const {vertices} = mazer;
        const o = ['o maze\n'];

        for (let i = 0; i < vertices.length; i ++) {
            let v0 = i;
            let v1 = (i + 1) % vertices.length;
            o.push('l  ' + (v0 + 1) + ' ' + (v1 + 1));
        }

        return o;
    }

    getWavefrontMazeBoxObj(mazer:Mazer): string[] {
        return [
            'o mazeBox\n',
            `l  -4 -3`,
            `l  -3 -2`,
            `l  -2 -1`,
            `l  -1 -4`
        ];
    }
}