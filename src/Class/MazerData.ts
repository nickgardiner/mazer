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
    },

    turnLeftDir: function(dir:number) {
        switch (dir) {
            case MazerCellFlags.Up:
                return MazerCellFlags.Left;

            case MazerCellFlags.Right:
                return MazerCellFlags.Up;

            case MazerCellFlags.Down:
                return MazerCellFlags.Right;

            case MazerCellFlags.Left:
                return MazerCellFlags.Down;

            default:
                throw new Error('turnLeftDir: invalid dir');
        }
    },

    turnRightDir: function(dir:number) {
        switch (dir) {
            case MazerCellFlags.Up:
                return MazerCellFlags.Right;

            case MazerCellFlags.Right:
                return MazerCellFlags.Down;

            case MazerCellFlags.Down:
                return MazerCellFlags.Left;

            case MazerCellFlags.Left:
                return MazerCellFlags.Up;

            default:
                throw new Error('turnRightDir: invalid dir');
        }
    }
}

export default class MazerData {
    public size:DOMPoint = new DOMPoint(5, 5);
    public data:Uint8Array = new Uint8Array();
    protected dirty:boolean = true;
    protected current:DOMPoint = new DOMPoint();

    constructor() {
        this.build();
        // this.clearData();
    }

    clearData() {
        this.data = new Uint8Array(this.size.x * this.size.y);
        this.dirty = false;

        // this.data[3] = MazerCellFlags.NoWalls;
        // this.data[3] &= ~MazerCellFlags.Left;
    }

    build() {
        if (this.dirty) {
            this.clearData();
        }

        this.current = new DOMPoint();

        this.processPath();

        this.dirty = true;

        // pick current cell with available moves

        // repeat
        //   if current cell has no moves, pick a new current cell from a touched cell with moves
        //   randomly pick a move in current cell
        //   remove wall in move direction and opposite wall in adjacent cell
        //   set current cell to adjacent cell
        // end repeat

    }

    processPath() {
        let moves;

        while (true) {
            this.data[this.current.z] |= MazerCellFlags.Touched;

            moves = this.getAvailableMoves(this.current.x, this.current.y, this.current.z);
            if (moves.length === 0) {
                const start = this.findPathStart();
                if (start) {
                    this.current = start;
                    continue;
                }
                break;
            }

            const move = moves[Math.floor(Math.random() * moves.length)];

            this.data[this.current.z] |= move.dir;
            this.data[move.target.z] |= MazerCellFlags.oppositeWall(move.dir);

            this.current = move.target;
        }
    }

    findPathStart(): null|DOMPoint {
        const start:Array<DOMPoint> = [];

        for (let i = 0; i < this.size.y; i++) {
            for (let j = 0; j < this.size.x; j++) {
                let index = i * this.size.x + j;

                if (
                    this.data[index] & MazerCellFlags.Touched
                    && this.hasAvailableMoves(j, i, index)
                ) {
                    start.push(new DOMPoint(j, i, index));
                }
            }
        }

        return start.length > 0
            ? start[Math.floor(Math.random() * start.length)]
            : null;
    }

    hasAvailableMoves(cellX:number, cellY:number, index:number): boolean {
        return this.canMoveUp(cellX, cellY, index)
            || this.canMoveRight(cellX, cellY, index)
            || this.canMoveDown(cellX, cellY, index)
            || this.canMoveLeft(cellX, cellY, index);
    }

    getAvailableMoves(cellX:number, cellY:number, index:number) {
        const moves = [];

        if (this.canMoveUp(cellX, cellY, index)) {
            moves.push({
                dir: MazerCellFlags.Up,
                target: new DOMPoint(
                    cellX,
                    cellY - 1,
                    index - this.size.x
                )
            });
        }

        if (this.canMoveLeft(cellX, cellY, index)) {
            moves.push({
                dir: MazerCellFlags.Left,
                target: new DOMPoint(
                    cellX - 1,
                    cellY,
                    index - 1
                )
            });
        }

        if (this.canMoveDown(cellX, cellY, index)) {
            moves.push({
                dir: MazerCellFlags.Down,
                target: new DOMPoint(
                    cellX,
                    cellY + 1,
                    index + this.size.x
                )
            });
        }

        if (this.canMoveRight(cellX, cellY, index)) {
            moves.push({
                dir: MazerCellFlags.Right,
                target: new DOMPoint(
                    cellX + 1,
                    cellY,
                    index + 1
                )
            });
        }

        return moves;
    }

    canMoveUp(cellX:number, cellY:number, index:number): boolean {
        return cellY > 0
            && !(this.data[index] & MazerCellFlags.Up)
            && !(this.data[index - this.size.x] & MazerCellFlags.Touched);
    }

    canMoveRight(cellX:number, cellY:number, index:number): boolean {
        return cellX < this.size.x - 1
            && !(this.data[index] & MazerCellFlags.Right)
            && !(this.data[index + 1] & MazerCellFlags.Touched);
    }

    canMoveDown(cellX:number, cellY:number, index:number): boolean {
        return cellY < this.size.y - 1
            && !(this.data[index] & MazerCellFlags.Down)
            && !(this.data[index + this.size.x] & MazerCellFlags.Touched);
    }

    canMoveLeft(cellX:number, cellY:number, index:number): boolean {
        return cellX > 0
            && !(this.data[index] & MazerCellFlags.Left)
            && !(this.data[index - 1] & MazerCellFlags.Touched);
    }
}