import React, { useRef } from 'react';

function VideoPlayer() {
    const videoRef = useRef(null);

    function handleFileChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            videoRef.current.src = event.target.result;
        };

        reader.readAsDataURL(file);
    }

    return (
        <div>
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <video ref={videoRef} controls />
        </div>
    );
}

export default VideoPlayer;