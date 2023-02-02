import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import Toolbar from "./Toolbar";
import Mazer from "../Class/Mazer";
import '../Asset/Style/App.css';
import '../Asset/Style/View.css';

export default function App() {
    const [mazer, setMazer] = useState<Mazer|null>(null);
    const ref: MutableRefObject<any> = useRef();

    useEffect(() => {
        setMazer(new Mazer(ref.current));
    }, []);

    return (
        <>
            {mazer && <Toolbar mazer={mazer} />}
            <div className="View">
                <canvas ref={ref} />
            </div>
        </>
    );
}
