import React, { useEffect, useState } from 'react';

import {Col, Container, ProgressBar, Row} from "react-bootstrap";
import axios from "axios";


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

export function ProgressBars(props){


    return(
        props.progress.map((prog,index)=>{
            return (
                <Container key={props.file_names[index]}>

                            <p>{props.file_names[index]}</p>

                            <ProgressBar style={{width:"100%"}} now={prog}>

                            </ProgressBar>



                </Container>
            )
        })
    )
}