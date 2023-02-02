import React, {MutableRefObject, useEffect, useRef, useState} from 'react';
import Toolbar from "./Toolbar";
import View from "./View";
import Mazer from "../Class/Mazer";
import '../Asset/Style/App.css';

export default function App() {
    const [mazer, setMazer] = useState<Mazer|null>(null);
    const ref: MutableRefObject<any> = useRef();

    useEffect(() => {
        setMazer(new Mazer(ref.current));
    }, []);

    return (
        <>
            {mazer && <Toolbar mazer={mazer} />}
            <View canvasRef={ref} />
        </>
    );
}
