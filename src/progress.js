import React, { useEffect, useState } from 'react';

import {Col, Container, ProgressBar, Row} from "react-bootstrap";


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
                });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [url]);

    return (
        <ProgressBar now={progress}>

        </ProgressBar>
    );
}

export function ProgressBars({progress,file_names}){

    console.log(progress)
    console.log(file_names)
    return(
        progress.map((prog,index)=>{
            return (
                <Container key={file_names[index]}>

                            <p>{file_names[index]}</p>

                            <ProgressBar style={{width:"100%"}} now={prog}>

                            </ProgressBar>



                </Container>
            )
        })
    )
}