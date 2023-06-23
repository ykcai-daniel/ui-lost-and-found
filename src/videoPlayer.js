import React from "react";

export default function VideoPlayer(props){
    const [vidID,vidURL]=props.props
    return(
        <video controls key={vidID} width={"100%"} >
            <source src={vidURL} />
        </video>
    )


}