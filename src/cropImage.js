import React, { useEffect, useRef } from 'react';

function CropImage({ src, squareSize }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        console.log("Use effect triggered")
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const img = new Image();
        img.src = src;
        console.log(img)
        img.onload = () => {
            console.log(img)
            const { width, height } = img;
            const size = Math.min(width, height);
            const x = 0;
            const y = 0;
            canvas.width = squareSize;
            canvas.height = squareSize;
            ctx.drawImage(img, x, y, size, size, 0, 0, squareSize, squareSize);
            // add transparent layer
            // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            // ctx.fillRect(0, 0, squareSize, squareSize);
            //
            // add name
            // ctx.font = '24px sans-serif';
            // ctx.fillStyle = 'white';
            // ctx.textAlign = 'center';
            // ctx.fillText("demo-text", squareSize / 2, squareSize - 20);

        };
    }, [src, squareSize]);

    return (
        <div className="image-hover-container">
            <canvas ref={canvasRef} />
            <div className="image-hover-overlay">
                <div className="image-hover-text">{"demo text"}</div>
            </div>
        </div>

    );
}

export default CropImage;