import React, {useCallback, useState} from "react";
import NumberInput from "./NumberInput";
import Mazer from "../Class/Mazer";
import "../Asset/Style/Toolbar.css";

interface ToolbarProps {
    mazer: Mazer;
}

interface MazerData {
    size: DOMPoint;
    cellSize: DOMPoint;
    thickness: DOMPoint;
    mazeDirty: boolean;
    metricsDirty: boolean;
}

export default function Toolbar({mazer}: ToolbarProps) {
    const [data, setData] = useState<MazerData>({
        size: new DOMPoint(mazer.data.size.x, mazer.data.size.y),
        cellSize: new DOMPoint(mazer.cellSize.x, mazer.cellSize.y),
        thickness: new DOMPoint(mazer.thickness.x, mazer.thickness.y),
        mazeDirty: false,
        metricsDirty: false,
    });

    const applyMazeCells = useCallback(() => {
        mazer.data.size.x = data.size.x;
        mazer.data.size.y = data.size.y;

        setData({
            ...data,
            mazeDirty: false
        });

        mazer.data.build(mazer.thickness);//mazer.cellSize, mazer.wallSize);
        mazer.view.render(mazer.cellSize);
    }, [data, mazer]);

    const applyCellMetrics = useCallback(() => {console.log('apply');
        setData({
            ...data,
            metricsDirty: false
        });

        mazer.setCellSize(data.cellSize.x, data.cellSize.y);
        mazer.setThickness(data.thickness.x, data.thickness.y);

        mazer.view.render(mazer.cellSize);
    }, [data, mazer]);

    const cancelMazeCells = useCallback(() => {
        setData({
            ...data,
            size: new DOMPoint(mazer.data.size.x, mazer.data.size.y),
            mazeDirty: false,
        });
    }, [data, mazer]);

    const cancelCellMetrics = useCallback(() => {
        setData({
            ...data,
            cellSize: new DOMPoint(mazer.cellSize.x, mazer.cellSize.y),
            thickness: new DOMPoint(mazer.thickness.x, mazer.thickness.y),
            metricsDirty: false,
        });
    }, [data, mazer]);

    const exportData = useCallback(() => {
        const win = window.open('', 'mazerExport', 'popup=1');
        if (!win) {
            throw new Error('unable to create export window');
        }

        win.focus();
        win.document.body.innerHTML = '';
        win.document.write('<pre>' + mazer.exporter.getWavefrontObjExport(mazer.cellSize, mazer.thickness) + '</pre>');
        win.document.title = 'Mazer Export';
    }, [mazer]);

    return (
        <div className="Toolbar">
            <div className="ToolbarSection">
                <div className="ToolbarSectionTitle">Maze</div>
                <div className="ToolbarSectionBody">
                    <div>
                        <span className="ToolbarInputLabelLeft">Cells X</span>
                        <NumberInput value={data.size.x}
                                     min={2}
                                     isInteger={true}
                                     onChange={(value) => {
                                         setData({
                                             ...data,
                                             size: new DOMPoint(value, data.size.y),
                                             mazeDirty: mazer.data.size.x !== value
                                                || mazer.data.size.y !== data.size.y
                                         });
                                     }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <NumberInput value={data.size.y}
                                     min={2}
                                     isInteger={true}
                                     onChange={(value) => {
                                         setData({
                                             ...data,
                                             size: new DOMPoint(data.size.x, value),
                                             mazeDirty: mazer.data.size.x !== data.size.x
                                                || mazer.data.size.y !== value
                                         });
                                     }}
                        />
                    </div>
                    <div className="ToolbarBodyCtrl">
                        <input type="button"
                               value={data.mazeDirty ? 'Apply' : 'Randomize'}
                               onClick={applyMazeCells}
                        />
                        {data.mazeDirty && <input type="button"
                               value="Cancel"
                               onClick={cancelMazeCells}
                        />}
                    </div>
                </div>
            </div>
            <div className="ToolbarSection">
                <div className="ToolbarSectionTitle">View Properties</div>
                <div className="ToolbarSectionBody">
                    <div>
                        <span className="ToolbarInputLabelLeft">Size X</span>
                        <NumberInput value={data.cellSize.x}
                                     min={0}
                                     onChange={(value) => {
                                         setData({
                                             ...data,
                                             cellSize: new DOMPoint(value, data.cellSize.y),
                                             metricsDirty: mazer.cellSize.x !== value
                                                 || mazer.cellSize.y !== data.cellSize.y
                                                 || mazer.thickness.x !== data.thickness.x
                                                 || mazer.thickness.y !== data.thickness.y
                                         });
                                     }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <NumberInput value={data.cellSize.y}
                                     min={0}
                                     onChange={(value) => {
                                         setData({
                                             ...data,
                                             cellSize: new DOMPoint(data.cellSize.x, value),
                                             metricsDirty: mazer.cellSize.x !== data.cellSize.x
                                                 || mazer.cellSize.y !== value
                                                 || mazer.thickness.x !== data.thickness.x
                                                 || mazer.thickness.y !== data.thickness.y
                                         });
                                     }}
                        />
                    </div>
                    <div>
                        <span className="ToolbarInputLabelLeft">Wall X</span>
                        <NumberInput value={data.thickness.x}
                                     min={0}
                                     max={0.5}
                                     onChange={(value) => {
                                         setData({
                                             ...data,
                                             thickness: new DOMPoint(value, data.thickness.y),
                                             metricsDirty: mazer.cellSize.x !== data.cellSize.x
                                                 || mazer.cellSize.y !== data.cellSize.y
                                                 || mazer.thickness.x !== value
                                                 || mazer.thickness.y !== data.thickness.y
                                         });
                                     }}
                        />
                        <span className="ToolbarInputLabel">Y</span>
                        <NumberInput value={data.thickness.y}
                                     min={0}
                                     max={0.5}
                                     onChange={(value) => {
                                         setData({
                                             ...data,
                                             thickness: new DOMPoint(data.thickness.x, value),
                                             metricsDirty: mazer.cellSize.x !== data.cellSize.x
                                                 || mazer.cellSize.y !== data.cellSize.y
                                                 || mazer.thickness.x !== data.thickness.x
                                                 || mazer.thickness.y !== value
                                         });
                                     }}
                        />
                    </div>
                    <div className="ToolbarBodyCtrl">
                        <input type="button"
                               value="Apply"
                               disabled={!data.metricsDirty}
                               onClick={applyCellMetrics}
                        />
                        <input type="button"
                               value="Cancel"
                               disabled={!data.metricsDirty}
                               onClick={cancelCellMetrics}
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