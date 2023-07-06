import React from "react";

export default function VideoPlayer({name}){
    console.log(`http://localhost:5000/files/${name}`)
    return(
        <video controls key={name} height={'405'} >
            <source src={`http://localhost:5000/files/${name}`} />
        </video>
    )


}