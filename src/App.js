import {Container, Button, Row, Col, Navbar, Form,Modal} from "react-bootstrap";
import  {ProgressBars} from "./progress";
import React, {useEffect, useRef, useState} from "react";
import { FaTrash, FaCamera } from 'react-icons/fa';
import axios from "axios";
import VideoPlayer from "./videoPlayer";
import Webcam from "react-webcam";
import "leaflet/dist/leaflet.css"
import styles from './style.module.css'
import MyMap from "./map";
import CropImage from "./cropImage";

const videoCameras = [
    { name: 'IMG_1752.mp4', position: [22.308, 113.917] },
    { name: 'IMG_1753.mp4', position: [22.305, 113.919] },
    { name: 'IMG_6757.mp4', position: [22.309, 113.916] },
];

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
    const [videoNames, setVideoNames] = useState([]);
    // the images to be submitted to backend
    const [imageObjects, setImageObjects] = useState([]);


    //an increasing id of images, used to identify which image to delete
    let [imageID,setImageID]=useState(0);

    //an increasing id of videos, used to identify (1) which video to delete, (2) which image to display
    let [videoID,setVideoID]=useState(0);

    //prevent submission when backend is running
    const [running, setRunning]=useState(false);

    //select which video should be played in the video player component
    const [selectedVideo, setSelectedVideo] = useState(null);

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
    const [videoPlayerShow,setVideoPlayerShow]=useState(false);
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
        console.log(videoNames)
        const videoNameWithoutID=[]
        for(let i=0;i<videoNames.length;i++){
            videoNameWithoutID.push(videoNames[i][1])
        }

        formData.append('video_names',JSON.stringify(videoNameWithoutID))
        formData.append('num_images',imageObjects.length.toString())
        formData.append('num_videos',videoNames.length.toString())
        setRunning(true)
        setExecVidName(videoNameWithoutID)
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
        console.log(`Selecting ${video}`)
        setSelectedVideo(video);
    };

    function onIconClick(e,key,selected){
        if(selected){
            console.log(`removing video with key ${key}`)
            //unselect the video
            const newNames=[]
            for(let i=0;i<videoNames.length;i++){
                const [id,_]=videoNames[i]
                if(id===key){
                    continue;
                }
                newNames.push(videoNames[i])
            }
            setVideoNames(newNames)
        }
        else{
            console.log(`Adding video with key ${key}`)
            //select the
            const newNames=[]
            for(let i=0;i<videoNames.length;i++){
                newNames.push(videoNames[i])
            }
            newNames.push([key,videoCameras[key].name])
            setVideoNames(newNames)
        }
        console.log(videoNames)
    }


    const handleClear=(e)=>{
        setResults([]);
        setSelectedVideo(null)
        setVideoNames([])
        setImageObjects([])
        setExecVidName([])

    }

    const [progress,setProgress]=useState([])


    useEffect(() => {
        const intervalId = setInterval(() => {
            if(execVidName.length===0){
                console.log("Video length zero")
                return;
            }
            axios.get("http://localhost:5000/progress")
                .then((response) => response.data)
                .then((data) => {
                    console.log(data)
                    setProgress(data)
                })
                .catch((error) => {
                    console.log(error.message)
                });
        }, 1000);

        return () => clearInterval(intervalId);
    },[execVidName]);

    //the page
    return (
        <>
            <Navbar bg="primary" variant="dark"  className="p-3">
                <Navbar.Brand style={{fontSize:"1.5rem"}}>Lost and Found</Navbar.Brand>
            </Navbar>
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
            <Modal show={selectedVideo!==null} onHide={e=>setSelectedVideo(null)} size={'lg'}>
                <Modal.Header closeButton>
                    <Modal.Title>Video Player</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Container  >
                        {/*Must have key element in video: https://stackoverflow.com/questions/23192565/video-embedded-into-html-doesnt-play*/}
                        {selectedVideo!==null && (
                            <VideoPlayer name={selectedVideo}>

                            </VideoPlayer>
                        )}
                    </Container>
                </Modal.Body>

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
                                    <Form.Control  accept={"image/*"} disabled={running} type="file" multiple  variant="primary" onClick={(e)=> {e.target.value = null}} onChange={handleImageChange} />
                                </Form.Group>

                            </Container>

                        </Container>
                        <Container className={classes.blockContainer}  >
                            {imageObjects.length > 0 && (
                                <Row className={'g-0'}>
                                    {imageObjects.map(([iid,imageObj]) => (

                                                <Col xs={4} key={iid} >
                                                    <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'90%',background:'white'}}>
                                                        <CropImage src={URL.createObjectURL(imageObj) } squareSize={120} name={imageObj.name}> </CropImage>
                                                        <div style={{width:'100%',display:'flex',flexDirection:'row',justifyContent:'space-around'}}> <div>{imageObj.name}</div> <div onClick={e=>handleImageDelete(iid)}><FaTrash></FaTrash></div></div>
                                                    </div>
                                                </Col>




                                    ))}
                                </Row>
                            )}


                        </Container>
                    </Container>


                    <Container className={classes.blockContainer}>

                        <Container >
                            <h4>Upload Videos</h4>


                        </Container>
                        <Container>
                            {videoNames.length > 0 && (
                                <Row className={"gx-0"}>
                                    {videoNames.map(([id,name]) => (
                                                <Col key={id} xs={6}>
                                                    <div onClick={e=>handleVideoSelect(e,id,name)}  style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'90%',background:'white'}}>
                                                        <CropImage src={`http://localhost:5000/thumbnails/${name}`} squareSize={160} name={name}></CropImage>
                                                        <div>
                                                            <div>{name}</div>
                                                        </div>
                                                    </div>
                                                </Col>

                                    ))}
                                </Row>
                            )}
                            {videoNames.length===0&&(<p>Please select videos from the map.</p>)}


                        </Container>
                    </Container>

                </Col>
                <Col xs={4}>

                    <Container className={classes.blockContainer} style={{ minHeight:"20vh"}}>
                        <h4>Floor Plan</h4>
                        <div style={{  width: '100%' }}>
                            <MyMap cameras={videoCameras} onIconClick={onIconClick}>
                            </MyMap>
                        </div>



                    </Container>



                </Col>
                <Col xs={4}>

                    <Container className={classes.blockContainer} >
                        <Row className={'gx-1'}>
                            <Col xs={7}><Button className={"btn btn-success "} style={{width:'100%',height:"10vh"}} onClick={handleUploadClick} disabled={running}>Search</Button></Col>
                            <Col xs={5}><Button className={"btn btn-danger "} style={{width:'100%',height:"10vh"}} disabled={running} onClick={handleClear}>Clear</Button></Col>
                        </Row>
                    </Container>

                    {/*<Container className={classes.blockContainer}>*/}
                    {/*    <Container >*/}
                    {/*        <h3>Configurations</h3>*/}
                    {/*    </Container>*/}
                    {/*    <Container >*/}
                    {/*        <Form>*/}
                    {/*            <Form.Group as={Row}  controlId="formPlaintextEmail">*/}
                    {/*                <Form.Label column >*/}
                    {/*                    Lost Item Category*/}
                    {/*                </Form.Label>*/}
                    {/*                <Form.Control  defaultValue="suitcase" />*/}
                    {/*            </Form.Group>*/}
                    {/*        </Form>*/}
                    {/*    </Container>*/}
                    {/*</Container>*/}



                    {
                        execVidName.length>0&& (
                        <Container className={classes.blockContainer}>
                            <h4>Progress</h4>
                            <ProgressBars  progress={progress} file_names={execVidName}></ProgressBars>
                         </Container>
                        )
                    }


                    <Container className={classes.blockContainer}>

                        <h4>Results</h4>
                        <Container>
                            {results.length===0&&!running &&(
                                <p>After selecting photos and videos, click "Submit" to search for lost moments.</p>
                            )}
                            {results.length > 0 && (

                                <Row>
                                    {

                                        results.map(([id,name,duration], index) => (


                                            <Col key={id} xs={6}>
                                                <div onClick={e=>handleVideoSelect(e,id,name)} style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'90%',background:'white'}}>
                                                    <CropImage src={`http://localhost:5000/thumbnails/${name}`} squareSize={160} name={name}></CropImage>
                                                    <div>
                                                        {/*Remove the "__RESULT__" prefix*/}
                                                        <div>{name.substring(10)}: {duration}</div>
                                                    </div>
                                                </div>
                                            </Col>



                                        ))}
                                </Row>
                            )}


                        </Container>
                    </Container>
                </Col>
            </Row>
        </>

    )
}