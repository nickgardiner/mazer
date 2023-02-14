import MazerData from "./MazerData";

export default class MazerExporter {
    protected data: MazerData;

    constructor(data:MazerData) {
        this.data = data;
    }

    getWavefrontObjExport(cellSize:DOMPoint, thickness:DOMPoint): string {
        return [
            '# Mazer 1.0 OBJ Exporter\n#\n',
            this.getWavefrontObjVertices(cellSize, thickness).join('\n') + '\n',
            this.getWavefrontMazeObj().join('\n') + '\n',
            this.getWavefrontMazeBoxObj().join('\n')
        ].join('\n');
    }

    getWavefrontObjVertices(cellSize:DOMPoint, thickness:DOMPoint): string[] {
        const w = this.data.size.x * cellSize.x + thickness.x * cellSize.x * 2;
        const h = this.data.size.y * cellSize.y + thickness.y * cellSize.y * 2;
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

        const v = [];

        for (let i = 0; i < this.data.vertices.length; i ++) {
            let x = (this.data.vertices[i].x * cellSize.x + l + thickness.x * cellSize.x).toFixed(4);
            let y = (this.data.vertices[i].z * cellSize.x).toFixed(4);
            let z = (this.data.vertices[i].y * cellSize.y + t + thickness.y * cellSize.y).toFixed(4);

            v.push(`v  ${x} ${y} ${z}`);
        }

        return v.concat([
            `v  ${rect.l} ${-thickness.x * cellSize.x} ${rect.t}`,
            `v  ${rect.r} ${-thickness.x * cellSize.x} ${rect.t}`,
            `v  ${rect.r} ${-thickness.x * cellSize.x} ${rect.b}`,
            `v  ${rect.l} ${-thickness.x * cellSize.x} ${rect.b}`
        ]);
    }

    getWavefrontMazeObj(): string[] {
        const o = ['o maze\n'];

        for (let i = 0; i < this.data.vertices.length; i ++) {
            let v0 = i;
            let v1 = (i + 1) % this.data.vertices.length;
            o.push('l  ' + (v0 + 1) + ' ' + (v1 + 1));
        }

        return o;
    }

    getWavefrontMazeBoxObj(): string[] {
        return [
            'o mazeBox\n',
            `l  -4 -3`,
            `l  -3 -2`,
            `l  -2 -1`,
            `l  -1 -4`
        ];
    }
}