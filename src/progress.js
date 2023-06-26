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

    const [progress,setProgress]=useState(props.file_names.map((_)=>0))
    useEffect(() => {
        const intervalId = setInterval(() => {
            axios.get("http://localhost:5000/progress")
                .then((response) => response.data)
                .then((data) => {
                    console.log("Json progress")
                    console.log(data)
                    setProgress(data)
                })
                .catch((error) => {
                    console.log(error.message)
                });
        }, 1000);

        return () => clearInterval(intervalId);
    }, props.file_names);
    return(
        props.file_names.map((file_name,index)=>{
            return (
                <Container>

                            <p>{file_name}</p>

                            <ProgressBar style={{width:"100%"}} now={progress[index]}>

                            </ProgressBar>



                </Container>
            )
        })
    )
}