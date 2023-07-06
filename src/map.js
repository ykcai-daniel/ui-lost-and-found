import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useState } from 'react';
import {icon} from "leaflet/src/layer/marker";
import securityCameraIcon from "./security-camera.svg"
import classes from "./style.module.css";


function MapIcon({id,cameraInfo,onClick}){
    const [selected,setSelected]=useState(false)
    const defaultIcon = icon({
        iconUrl: securityCameraIcon,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
    const bigIcon = icon({
        iconUrl: securityCameraIcon,
        iconSize: [30, 47],
        iconAnchor: [12, 41],
    });
    const selectedIcon = icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });
    
    return (
        <Marker key={id}
                position={cameraInfo.position}
                icon={selected ? selectedIcon: defaultIcon}
                eventHandlers={{
                    click: (e) => {
                        console.log(cameraInfo.name)
                        onClick(e,id,selected)
                        setSelected(!selected)
                    },
                }}
        >

        </Marker>
    )
}
export default function  MyMap({cameras,onIconClick}) {
    const airportBounds = [
        [22.303, 113.913],
        [22.311, 113.921],
    ];

    
    return (
        <div>
            <MapContainer attributionControl={false} bounds={airportBounds} zoom={10} scrollWheelZoom={false} style={{ height: '45vh', width: '100%' }}>
                <TileLayer  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {cameras.map((camera,index) => (
                    <MapIcon id={index} cameraInfo={camera} onClick={onIconClick}></MapIcon>

                ))}
            </MapContainer>
        </div>
    );
}