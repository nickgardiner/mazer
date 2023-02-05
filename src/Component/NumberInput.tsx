import {useEffect, useState} from "react";

interface NumberInputProps {
    value?: number;
    min?: number;
    max?: number;
    isInteger?: boolean;
    onChange?: (value:number) => void;
}

export default function NumberInput({
    value,
    min,
    max,
    isInteger,
    onChange
}: NumberInputProps) {
    const [userValue, setUserValue] = useState<string>('');
    const [valid, setValid] = useState<boolean>(true);

    useEffect(() => {
        setUserValue(typeof value === 'number' ? value.toString() : '')
    }, [value]);

    return (
        <input type="text"
               value={userValue}
               className={valid ? '' : 'invalid'}
               onChange={(e) => {
                   let newValue = parseFloat(e.target.value);
                   let valid = !isNaN(newValue);

                   if (valid && isInteger && Math.floor(newValue) !== newValue) {
                       valid = false;
                   } else if (valid && min !== undefined && newValue < min) {
                       valid = false;
                   } else if (valid && max !== undefined && newValue > max) {
                       valid = false;
                   }

                   setUserValue(e.target.value);
                   setValid(valid);
               }}
               onBlur={(e) => {
                   let newValue = parseFloat(e.target.value);
                   const valid = !isNaN(newValue);

                   if (!valid
                       || (isInteger && Math.floor(newValue) !== newValue)
                   ) {
                       setUserValue(typeof value === 'number' ? value.toString() : '');
                       setValid(true);
                       return;
                   }

                   newValue = isInteger ? Math.floor(newValue) : newValue;

                   if (min !== undefined && newValue < min) {
                       newValue = min;
                   } else if (max !== undefined && newValue > max) {
                       newValue = max;
                   }

                   setUserValue(newValue.toString());
                   setValid(true);
                   onChange && onChange(newValue);
               }}
        />
    );
}