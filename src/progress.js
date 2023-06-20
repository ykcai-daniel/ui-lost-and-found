import React, { useEffect, useState } from 'react';

import {ProgressBar} from "react-bootstrap";


function ProgressPoller({ url }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    if (data.progress >= 100) {
                        clearInterval(intervalId);
                    } else {
                        setProgress(data.progress);
                    }
                })
                .catch((error) => {
                    console.log(error.message)
                    clearInterval(intervalId);
                    setProgress(40);
                });
        }, 3000);

        return () => clearInterval(intervalId);
    }, [url]);

    return (
        <ProgressBar now={progress}>

        </ProgressBar>
    );
}

export default ProgressPoller;