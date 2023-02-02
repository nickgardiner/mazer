import React, {MutableRefObject} from "react";
import '../Asset/Style/View.css';

interface ViewProps{
    canvasRef: MutableRefObject<any>;
}

export default function View({canvasRef}: ViewProps) {
    return (
        <div className="View">
            <canvas ref={canvasRef} />
        </div>
    );
}