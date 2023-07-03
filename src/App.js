import {Container, Button, Row, Col, Navbar, Form,Modal} from "react-bootstrap";
import  {ProgressBars} from "./progress";
import React, {useEffect, useRef, useState} from "react";
import { FaTrash, FaImage, FaVideo, FaCamera } from 'react-icons/fa';
import axios from "axios";
import VideoPlayer from "./videoPlayer";
import Webcam from "react-webcam";
import backgroundImage from './map.png';
import "leaflet/dist/leaflet.css"
import styles from './style.module.css'
import {ImageOverlay, MapContainer, Marker, TileLayer} from "react-leaflet";
import {Handler} from "leaflet/src/core";
import MarkerSelector from "./selector";
import MyMap from "./selector";
import CropImage from "./cropImage";

//TODO: floor plan
//TODO: decompose this huge component to smaller elements; clean up states


//IMPORTANT: There will be undefined behaviour when the backend is accessed from multiple clients simultaneously.
//This will be fixed later with session control. However, it is not necessary for demo purpose.
//Please only open one tab
export default function Layout(){
    //bootstrap formats
    const classes={
        fileListItem:" bg-light-subtle rounded mt-1",
        fileListItemSelected:"bg-secondary-subtle rounded mt-1 p-1",
        blockContainer:"bg-light rounded mt-1 p-1",
    }
    //the videos to be submitted to backend
    const [videoObjects, setVideoObjects] = useState([]);
    // the images to be submitted to backend
    const [imageObjects, setImageObjects] = useState([]);


    //an increasing id of images, used to identify which image to delete
    let [imageID,setImageID]=useState(0);

    //an increasing id of videos, used to identify (1) which video to delete, (2) which image to display
    let [videoID,setVideoID]=useState(0);

    //prevent submission when backend is running
    const [running, setRunning]=useState(false);

    //select which video should be played in the video player component
    const [selectedVideo, setSelectedVideo] = useState([-1,"start"]);

    //result of the backend
    //array: of arrays [0, "__RESULT__IMG_1752.mp4", [12,13]]
    //format, imageid, image name in backend, duration in frames
    const [results,setResults]=useState([]);

    const [execVidName,setExecVidName]=useState([]);

    //display the camera for photo taking
    const [cam,setCam]=useState(false);
    const camRef=useRef(null);
    const [captureID,setCaptureID]=useState(0);
    const handleClose = () => setCam(false);
    //store the File object of the captured image
    const [capture,setCapture]=useState(null);
    const handleVideoChange = (event) => {
        const files = event.target.files;
        console.log(event);
        const newFiles=[];
        for (let i=0; i<videoObjects.length;i++){
            newFiles.push(videoObjects[i])
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            newFiles.push([videoID,file]);
        }
        setVideoID(videoID+files.length);

        setVideoObjects(newFiles);
    };
    const handleVideoDelete = (index) => {
        console.log(`Expecting to delete video with index ${index}`)
        const newState=[]
        for (let i = 0; i < videoObjects.length; i++) {
            const [id,file] = videoObjects[i];
            if(id===index){
                console.log(`Deleting ${videoObjects[i]}`)
                continue
            }
            newState.push([id,file]);
        }
        setSelectedVideo([-1,null])
        setVideoObjects(newState)
    };
    const handleImageChange = (event) => {


        const files = event.target.files;
        const newFiles=[]
        for (let i = 0; i < imageObjects.length; i++) {
            newFiles.push(imageObjects[i]);

        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            newFiles.push([imageID+i,file]);

        }
        setImageID(imageID+files.length)
        console.log(imageObjects)
        setImageObjects(newFiles);

    };
    const handleImageDelete = (idToDelete) => {
        console.log("Before delete:")
        console.log(imageObjects)
        const newState=[]
        for (let i = 0; i < imageObjects.length; i++) {
            const [id,file] = imageObjects[i];
            if(id===idToDelete){
                continue
            }
            newState.push([id,file]);
        }

        setImageObjects(newState)
    };


    //submit videos and image to backend with POST
    const handleUploadClick = () => {
        setResults([])
        const formData = new FormData();
        imageObjects.forEach(([id,image], index) => {
            console.log(`Uploading image ${image.name}`)
            console.log(image)
            formData.append(`image${index}`,image,image.name);
        });
        const vidNames=[]
        videoObjects.forEach(([id,video], index) => {
            console.log(`Uploading video ${video.name}`)
            console.log(video)
            formData.append(`video${index}`,video,video.name);
            vidNames.push(video.name)
        });
        formData.append('file_names',JSON.stringify(vidNames))
        formData.append('num_images',imageObjects.length.toString())
        formData.append('num_videos',videoObjects.length.toString())
        setRunning(true)
        setExecVidName(vidNames)
        let res=null;
        axios.post('http://localhost:5000/upload', formData,{
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then((response) => {
                //manually set all progress to 100 once response is received

                console.log("Backend Response:")
                console.log(response.data)
                setProgress(progress.map(_=>100))
                res=response
                const blobs=[];
                for(let i=0;i<res.data.length;i++){
                    const [name,time]=res.data[i]
                    blobs.push([videoID+i,name,time])
                }
                setVideoID(videoID+res.data.length)
                setResults(blobs)
                setRunning(false)
                console.log(blobs)
            })

            .catch((error) => {
                console.log("Error caught")
                console.log(error)
                // Handle upload error
                setRunning(false);
            });

    };


    //set image to display in image player
    const handleVideoSelect = (e,id,video) => {
        console.log("Setting video state")
        console.log(video)
        setSelectedVideo([id,video]);
    };


    const handleClear=(e)=>{
        setResults([]);
        setSelectedVideo([-1,"start"])
        setVideoObjects([])
        setImageObjects([])
        setExecVidName([])

    }

    const appendVideo=(e,url)=>{
        const currentVideos=[];
        for(let i=0;i<videoObjects.length;i++){
            currentVideos.push([videoObjects[i]]);
        }
        currentVideos.push([videoID,url])
        setVideoID(videoID+1)
        setVideoObjects(currentVideos)
    }




    const [progress,setProgress]=useState([])


    const cameraInfo=[
        {style:{position:"absolute",top:"10%",left:"20%",} ,url:""},
        {style:{position:"absolute",top:"25%",left:"30%",} ,url:""},
        {style:{position:"absolute",top:"45%",left:"40%",} ,url:""},
        {style:{position:"absolute",top:"60%",left:"30%",} ,url:""},
        {style:{position:"absolute",top:"75%",left:"20%",} ,url:""},
        {style:{position:"absolute",top:"45%",left:"65%",} ,url:""},
        {style:{position:"absolute",top:"45%",left:"85%",} ,url:""},
    ]
    useEffect(() => {
        const intervalId = setInterval(() => {
            axios.get("http://localhost:5000/progress")
                .then((response) => response.data)
                .then((data) => {
                    setProgress(data)
                })
                .catch((error) => {
                    console.log(error.message)
                });
        }, 1000);

        return () => clearInterval(intervalId);
    },[setProgress]);

    //the page
    return (
        <>
            <Navbar bg="primary" variant="dark"  className="p-2">
                <Navbar.Brand style={{fontSize:"2rem"}}>Lost and Found</Navbar.Brand>
            </Navbar>
            {/*webcam popup component*/}
            <Modal show={cam}  onHide={handleClose} size={'xl'}>
                <Modal.Header closeButton>
                    <Modal.Title>Take a photo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>
                            <Container className={classes.blockContainer}>

                                <Webcam
                                    audio={false}
                                    videoConstraints={{
                                        width: 1280,
                                        height: 720,
                                        facingMode: "user"
                                    }}
                                    screenshotFormat="image/jpeg"
                                    width={"100%"}
                                    ref={camRef}
                                >
                                </Webcam>
                            </Container>
                        </Col>
                        <Col>
                            {capture!==null && (
                                <Container className={classes.blockContainer}>
                                    <img alt={"Loading"} src={URL.createObjectURL(capture)}>
                                    </img>
                                </Container>
                            )}
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={( ) => {


                        const imageSrc = camRef.current.getScreenshot();
                        const byteCharacters = atob(imageSrc.split(',')[1]);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'image/jpeg' });
                        const file = new File([blob], `capture-${captureID}.jpg`, { type: 'image/jpeg' });
                        setCaptureID(captureID+1)
                        console.log(file);
                        setCapture(file);
                    }}>
                        Capture
                    </Button>
                    <Button variant="primary" onClick={()=>{
                        const tmpImages=[];
                        for(let i=0;i<imageObjects.length;i++){
                            tmpImages.push(imageObjects[i])
                        }
                        tmpImages.push([imageID,capture])
                        setImageID(imageID+1)
                        console.log("New images:")
                        console.log(tmpImages)
                        setImageObjects(tmpImages)
                        setCapture(null)
                        handleClose()
                    }}
                            disabled={capture==null}
                    >
                        Save Image
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>

            </Modal>
            <Row>
                <Col xs={4}>
                    <Container className={[styles.containerboxhover,classes.blockContainer].join(" ")}>
                        <Container >
                            <Row>
                                <Col xs={10}>
                                    <h4>Upload Image</h4>
                                </Col>
                                <Col xs={2}>
                                    <Container onClick={
                                        ()=>{setCam(true)}
                                    }><FaCamera className={styles.hoverbox15}></FaCamera></Container>
                                </Col>
                            </Row>
                            <Container className={classes.blockContainer}>
                                <Form.Group key={imageID} controlId="formFile" >
                                    {/*onClick allows uploading two identical images*/}
                                    <Form.Control disabled={running} type="file" multiple  variant="primary" onClick={(e)=> {e.target.value = null}} onChange={handleImageChange} />
                                </Form.Group>

                            </Container>

                        </Container>
                        <Container className={classes.blockContainer}  >
                            {imageObjects.length > 0 && (
                                <Row className={'g-0'}>
                                    {imageObjects.map(([iid,imageObj]) => (

                                                <Col xs={4} key={iid} >

                                                    <CropImage src={URL.createObjectURL(imageObj) } squareSize={120} name={imageObj.name}> </CropImage>


                                                </Col>




                                    ))}
                                </Row>
                            )}


                        </Container>
                    </Container>


                    <Container className={classes.blockContainer}>

                        <Container >
                            <Row>
                                <Form.Group key={videoID}  controlId="formFile" className="mb-3">
                                    <Form.Label><h4>Upload Videos</h4></Form.Label>
                                    <Form.Control type="file" multiple  variant="primary" onClick={(e)=> {e.target.value = null}}  onChange={handleVideoChange} disabled={running} />
                                </Form.Group>

                            </Row>

                        </Container>
                        <Container>
                            {videoObjects.length > 0 && (
                                <Col>
                                    {videoObjects.map(([vid,videoObj], index) => (
                                        <Container key={vid} className={[vid===selectedVideo[0]?classes.fileListItemSelected:classes.fileListItem,styles.listitemhover].join(" ")} >
                                            <Row  >
                                                <Col xs={1}>
                                                    <FaVideo height={'25px'}></FaVideo>

                                                </Col>
                                                <Col xs={8}  onClick={(e) => handleVideoSelect(e,vid,URL.createObjectURL(videoObj))}>
                                                    {videoObj.name}
                                                </Col>

                                                <Col xs={2}>

                                                    <Button  onClick={() => handleVideoDelete(vid)} >
                                                        <FaTrash></FaTrash>
                                                    </Button>

                                                </Col>
                                            </Row>
                                        </Container>


                                    ))}
                                </Col>
                            )}


                        </Container>
                    </Container>

                </Col>
                <Col xs={5}>
                    <Modal show={false}>
                        <h4>Video Player</h4>
                        <Container  style={{ minHeight:"30vh"}}>
                            {/*Must have key element in video: https://stackoverflow.com/questions/23192565/video-embedded-into-html-doesnt-play*/}
                            {selectedVideo[1]!=='start'&&selectedVideo[1]!==null && (
                                <VideoPlayer props={selectedVideo}>

                                </VideoPlayer>
                            )}
                        </Container>

                    </Modal>
                    <Container className={classes.blockContainer} style={{ minHeight:"20vh"}}>
                        <h4>Floor Plan</h4>
                        <div style={{  width: '100%' }}>
                            {/*<MapContainer*/}
                            {/*    maxBoundsViscosity={1.0}*/}
                            {/*    style={{ height: '100%', width: '100%' }}*/}
                            {/*              bounds={[*/}
                            {/*                  [22.303, 113.913],*/}
                            {/*                  [22.311, 113.921],*/}
                            {/*              ]}*/}
                            {/*              zoom={16}*/}
                            {/*              scrollWheelZoom={true}*/}
                            {/*>*/}
                            {/*    <TileLayer  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />*/}
                            {/*    <Marker position={[22.308, 113.917]} ><FaVideo></FaVideo></Marker>*/}
                            {/*    <Marker position={[22.308, 113.917]} ><FaVideo></FaVideo></Marker>*/}
                            {/*    <Marker position={[22.308, 113.917]} ><FaVideo></FaVideo></Marker>*/}
                            {/*    <Marker position={[22.308, 113.917]} ><FaVideo></FaVideo></Marker>*/}

                            {/*    /!* Add markers or other components here *!/*/}
                            {/*</MapContainer>*/}
                            <MyMap>

                            </MyMap>
                        </div>
                        {/*<div style={{position:'relative'}}>*/}
                        {/*    <img style={{width:'100%'}} src={backgroundImage} alt={"Cannot show"}>*/}
                        {/*    </img>*/}
                        {/*    {*/}
                        {/*        cameraInfo.map((info,index)=>{*/}
                        {/*            return (*/}
                        {/*                <div key={index}  style={info.style}><Row className={"gx-1"}><Col><FaVideo className={styles.hoverbox15} ></FaVideo></Col><Col>{index}</Col><Col> <Form.Check></Form.Check></Col></Row></div>*/}
                        {/*            )})*/}
                        {/*    }*/}
                        {/*</div>*/}


                    </Container>



                </Col>
                <Col xs={3}>

                    <Container className={classes.blockContainer} >
                        <Row className={'gx-1'}>
                            <Col xs={7}><Button className={"btn btn-success "} style={{width:'100%',height:"10vh"}} onClick={handleUploadClick} disabled={running}>Launch</Button></Col>
                            <Col xs={5}><Button className={"btn btn-danger "} style={{width:'100%',height:"10vh"}} disabled={running} onClick={handleClear}>Clear</Button></Col>
                        </Row>
                    </Container>

                    <Container className={classes.blockContainer}>
                        <Container >
                            <h3>Configurations</h3>
                        </Container>
                        <Container >
                            <Form>
                                <Form.Group as={Row}  controlId="formPlaintextEmail">
                                    <Form.Label column >
                                        Lost Item Category
                                    </Form.Label>
                                    <Form.Control  defaultValue="suitcase" />
                                </Form.Group>
                            </Form>
                        </Container>
                    </Container>


                    {execVidName.length>0 && (
                        <Container className={classes.blockContainer}>
                            <h4>Progress</h4>
                            {/*<ProgressBars progress={progress} file_names={execVidName}></ProgressBars>*/}
                        </Container>)
                    }

                    <Container className={classes.blockContainer}>

                        <h4>Results</h4>
                        <Container>
                            {results.length > 0 && (

                                <Col>
                                    {

                                        results.map(([id,vidName,duration], index) => (
                                            <Container key={id} onClick={(e,id)=>{handleVideoSelect(e,id,`http://localhost:5000/results/${vidName}`)}} className={[classes.fileListItem,styles.containerboxhover].join(" ")}>
                                                <Row className={'gx-0'}>
                                                    <Col xs={1}>
                                                        <FaVideo height={'25px'}></FaVideo>

                                                    </Col>
                                                    <Col xs={6} >
                                                        <p className={"text-left"}> {vidName.substring(10)}:</p>
                                                    </Col>

                                                    <Col xs={5} >
                                                        <p className={"text-right"}>{duration!==undefined && duration.length>1?`${duration[0]}-${duration[1]}`:"None found"}</p>

                                                    </Col>
                                                </Row>
                                            </Container>


                                        ))}
                                </Col>
                            )}


                        </Container>
                    </Container>
                </Col>
            </Row>
        </>

    )
}