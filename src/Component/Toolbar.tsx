import React, {useCallback, useState} from "react";
import Mazer from "../Class/Mazer";
import "../Asset/Style/Toolbar.css";

interface ToolbarProps {
    mazer: Mazer;
}

interface UserPoint2D {
    x: string;
    y: string;
}

interface MazerData {
    size: UserPoint2D,
    cellSize: UserPoint2D,
    thickness: UserPoint2D
}

function parseUserFloat(value:string, min:number, max:number): number {
    const dec:number = value === '' ? 0 : parseFloat(value);
    return dec < min ? min : dec > max ? max : dec;
}

function parseUserInt(value:string, min:number, max:number): number {
    const int:number = value === '' ? 0 : parseInt(value, 10);
    const intMin = Math.floor(min);
    const intMax = Math.floor(max);

    return int < intMin ? intMin : int > intMax ? intMax : int;
}

export default function Toolbar({mazer}: ToolbarProps) {
    const [data, setData] = useState<MazerData>({
        size: {x:mazer.data.size.x.toString(), y:mazer.data.size.y.toString()},
        cellSize: {x:mazer.cellSize.x.toString(), y:mazer.cellSize.y.toString()},
        thickness: {x:mazer.thickness.x.toString(), y:mazer.thickness.y.toString()}
    });

    const applyMazeCells = useCallback(() => {
        mazer.data.size.x = parseUserInt(data.size.x, 1, Infinity);
        mazer.data.size.y = parseUserInt(data.size.y, 1, Infinity);

        mazer.data.build();
        mazer.render();
    }, [data, mazer]);

    const applyCellMetrics = useCallback(() => {
        mazer.cellSize.x = parseUserFloat(data.cellSize.x, 0, Infinity);
        mazer.cellSize.y = parseUserFloat(data.cellSize.y, 0, Infinity);

        mazer.thickness.x = parseUserFloat(data.thickness.x, 0, 0.5);
        mazer.thickness.y = parseUserFloat(data.thickness.y, 0, 0.5);

        mazer.render();
    }, [data, mazer]);

    const exportData = useCallback(() => {
        const win = window.open('', 'mazerExport', 'popup=1');
        if (!win) {
            throw new Error('unable to create export window');
        }

        win.document.write('<pre>' + mazer.builder.getWavefrontObjExport(mazer) + '</pre>');
        win.document.title = 'Mazer Export';
    }, [mazer]);

    return (
        <div className="Toolbar">
            <div className="ToolbarSection">
                <div className="ToolbarSectionTitle">Maze</div>
                <div className="ToolbarSectionBody">
                    <div>
                        <span className="ToolbarInputLabelLeft">Cells X</span>
                        <input type="text"
                               value={data.size.x}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       size: {x:e.target.value, y:data.size.y},
                                   });
                               }}
                               onBlur={(e) => {
                                   setData({
                                       ...data,
                                       size: {x: parseUserInt(e.target.value, 2, Infinity).toString(), y:data.size.y}
                                   });
                               }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <input type="text"
                               value={data.size.y}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       size: {x:data.size.x, y:e.target.value},
                                   });
                               }}
                               onBlur={(e) => {
                                   setData({
                                       ...data,
                                       size: {x:data.size.x, y: parseUserInt(e.target.value, 2, Infinity).toString()}
                                   });
                               }}
                        />
                    </div>
                    <div className="ToolbarBodyCtrl">
                        <input type="button"
                               value="Apply"
                               onClick={applyMazeCells}
                        />
                    </div>
                </div>
            </div>
            <div className="ToolbarSection">
                <div className="ToolbarSectionTitle">Cell Metrics</div>
                <div className="ToolbarSectionBody">
                    <div>
                        <span className="ToolbarInputLabelLeft">Size X</span>
                        <input type="text"
                               value={data.cellSize.x}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       cellSize: {x:e.target.value, y:data.cellSize.y}
                                   });
                               }}
                               onBlur={(e) => {
                                   setData({
                                       ...data,
                                       cellSize: {x: parseUserInt(e.target.value, 0, Infinity).toString(), y:data.cellSize.y}
                                   });
                               }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <input type="text"
                               value={data.cellSize.y}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       cellSize: {x:data.cellSize.x, y:e.target.value}
                                   });
                               }}
                        />
                    </div>
                    <div>
                        <span className="ToolbarInputLabelLeft">Wall X</span>
                        <input type="text"
                               value={data.thickness.x}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       thickness: {x:e.target.value, y:data.thickness.y}
                                   });
                               }}
                               onBlur={(e) => {
                                   setData({
                                       ...data,
                                       thickness: {x: parseUserFloat(e.target.value, 0, 0.5).toString(), y:data.thickness.y}
                                   });
                               }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <input type="text"
                               value={data.thickness.y}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       thickness: {x:data.thickness.x, y:e.target.value}
                                   });
                               }}
                               onBlur={(e) => {
                                   setData({
                                       ...data,
                                       thickness: {x:data.thickness.x, y:parseUserFloat(e.target.value, 0, 0.5).toString()}
                                   });
                               }}
                        />
                    </div>
                    <div className="ToolbarBodyCtrl">
                        <input type="button"
                               value="Apply"
                               onClick={applyCellMetrics}
                        />
                    </div>
                </div>
            </div>
            <div className="ToolbarSection">
                <div className="ToolbarSectionTitle">Export Data</div>
                <div className="ToolbarSectionBody">
                    <div className="ToolbarBodyCtrl">
                        <input type="button"
                               value="Export OBJ"
                               onClick={exportData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}