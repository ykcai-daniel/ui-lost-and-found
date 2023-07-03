import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useState } from 'react';
import {icon} from "leaflet/src/layer/marker";
import securityCameraIcon from "./security-camera.svg"
import classes from "./style.module.css";
export default function  MyMap() {
    const airportBounds = [
        [22.303, 113.913],
        [22.311, 113.921],
    ];

    const markers = [
        { id: 0, name: 'Marker 1', position: [22.308, 113.917] },
        { id: 1, name: 'Marker 2', position: [22.305, 113.919] },
        { id: 2, name: 'Marker 3', position: [22.309, 113.916] },
    ];

    const [selectedMarkers, setSelectedMarkers] = useState(markers.map(m=>false));
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


    function click(e,key){
        const result=[]
        for(let i=0;i<selectedMarkers.length;i++){
            if(i===key){
                result.push(!selectedMarkers[i])
            }
            else{
                result.push(selectedMarkers[i])
            }

        }
        console.log(result)
        setSelectedMarkers(result)
    }

    return (
        <div>
            <MapContainer bounds={airportBounds} zoom={16} scrollWheelZoom={false} style={{ height: '45vh', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markers.map(marker => (

                        <Marker key={marker.id}
                                position={marker.position}
                                icon={selectedMarkers[marker.id] ? selectedIcon: defaultIcon}
                                eventHandlers={{
                                    click: (e) => {
                                        click(e,marker.id)  // will print 'FooBar' in console
                                    },
                                }}
                        >

                        </Marker>



                ))}
            </MapContainer>
        </div>
    );
}