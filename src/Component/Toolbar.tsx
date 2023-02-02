import React, {useCallback, useState} from "react";
import Mazer from "../Class/Mazer";
import "../Asset/Style/Toolbar.css";

interface ToolbarProps {
    mazer: Mazer;
}

interface MazerData {
    size: DOMPoint,
    cellSize: any,
    thickness: any
}

function parseValue(value:string, min:number, max:number): number {
    const dec:number = value === '' ? 0 : parseFloat(value);
    return dec < min ? min : dec > max ? max : dec;
}

export default function Toolbar({mazer}: ToolbarProps) {
    const [data, setData] = useState<MazerData>({
        size: new DOMPoint(mazer.data.size.x, mazer.data.size.y),
        cellSize: {x:mazer.cellSize.x, y:mazer.cellSize.y},
        thickness: {x:mazer.thickness.x, y:mazer.thickness.y}
    });

    const applyMazeCells = useCallback(() => {
        mazer.data.size.x = data.size.x;
        mazer.data.size.y = data.size.y;

        mazer.data.build();
        mazer.render();
    }, [data, mazer]);

    const applyCellMetrics = useCallback(() => {
        mazer.cellSize.x = parseValue(data.cellSize.x, 0, Infinity);
        mazer.cellSize.y = parseValue(data.cellSize.y, 0, Infinity);

        mazer.thickness.x = parseValue(data.thickness.x, 0, 0.5);
        mazer.thickness.y = parseValue(data.thickness.y, 0, 0.5);

        mazer.render();
    }, [data, mazer]);

    const exportData = useCallback(() => {
        const win = window.open('', 'mazerExport', 'popup=1');
        if (!win) {
            throw new Error('unable to create export window');
        }

        win.document.write('<pre>' + mazer.builder.getWavefrontObjExport(mazer) + '</pre>');
        win.document.title = 'Mazer Export';
    }, []);

    const constrainValue = useCallback((min:number, max:number) => {

    }, []);

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
                                       size: new DOMPoint(parseInt(e.target.value, 10), data.size.y),
                                   });
                               }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <input type="text"
                               value={data.size.y}
                               onChange={(e) => {
                                   setData({
                                       ...data,
                                       size: new DOMPoint(data.size.x, parseInt(e.target.value, 10)),
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