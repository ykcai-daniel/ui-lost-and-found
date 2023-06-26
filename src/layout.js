import {Container, ListGroup, ListGroupItem, Button, Row, Col, Navbar, Nav, Form, FormGroup} from "react-bootstrap";
import  {ProgressBars} from "./progress";
import React, { useState} from "react";
import { FaTrash, FaImage, FaVideo, FaCamera } from 'react-icons/fa';
import axios from "axios";
import VideoPlayer from "./videoPlayer";

//TODO: webcam
//TODO: floor plan
//TODO: multiple progress bar
//TODO: decompose this huge component to smaller elements; clean up states
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
                console.log(response.data)
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
        setVideoObjects([])
        setImageObjects([])
        setSelectedVideo([-1,"start"])
        setResults([])
        setExecVidName([])

    }

    //the page
    return (
        <>
            <Navbar bg="primary" variant="dark"  className="p-2">
                <Navbar.Brand style={{fontSize:"2rem"}}>Lost and Found</Navbar.Brand>
                <Button onClick={handleClear} disabled={running}>Clear</Button>
            </Navbar>
        <Row  >
            <Col xs={3}>
                <Container className={ classes.blockContainer}>
                    <Container >
                        <Row>
                            <Form.Group controlId="formFile" >
                                <Form.Label><h4>Upload Images</h4></Form.Label>
                                <Form.Control disabled={running} type="file" multiple  variant="primary"  onChange={handleImageChange} />
                            </Form.Group>

                        </Row>

                    </Container>
                    <Container className={classes.blockContainer} >
                        {imageObjects.length > 0 && (
                            <Col>
                                {imageObjects.map(([iid,imageObj]) => (

                                        <Container className={ classes.fileListItem} >
                                            <Row key={iid}>
                                            <Col xs={1}>

                                                    <FaImage height={'25px'}></FaImage>


                                            </Col>
                                            <Col xs={8} >
                                                {imageObj.name}
                                            </Col>

                                            <Col xs={2}>
                                                    <Button onClick={() => handleImageDelete(iid)}>
                                                        <FaTrash ></FaTrash>
                                                    </Button>
                                            </Col>
                                            </Row>
                                        </Container>


                                ))}
                            </Col>
                        )}


                    </Container>
                </Container>
                <Container className={classes.blockContainer}>

                    <Container >
                        <Row>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label><h4>Upload Videos</h4></Form.Label>
                                <Form.Control type="file" multiple  variant="primary"  onChange={handleVideoChange} disabled={running} />
                            </Form.Group>

                        </Row>

                    </Container>
                    <Container>
                        {videoObjects.length > 0 && (
                            <Col>
                                {videoObjects.map(([vid,videoObj], index) => (
                                    <Container key={vid} className={vid===selectedVideo[0]?classes.fileListItemSelected:classes.fileListItem} >
                                        <Row  onClick={(e) => handleVideoSelect(e,vid,URL.createObjectURL(videoObj))}>
                                            <Col xs={1}>
                                                    <FaVideo height={'25px'}></FaVideo>

                                            </Col>
                                            <Col xs={8} >
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
                <Container className={classes.blockContainer}>
                    <h4>Video Player</h4>
                    <Container  style={{ minHeight:"50vh"}}>
                        {/*Must have key element in video: https://stackoverflow.com/questions/23192565/video-embedded-into-html-doesnt-play*/}
                        {selectedVideo[1]!=='start' && (
                            <VideoPlayer props={selectedVideo}>

                            </VideoPlayer>
                        )}
                    </Container>

                </Container>
                <Container className={classes.blockContainer} style={{ minHeight:"20vh"}}>
                    Airport Floor Plan

                </Container>

            </Col>
            <Col xs={3}>

                    <Container className={classes.blockContainer} >
                        <Row className={'gx-1'}>
                            <Col xs={7}><Button className={"btn btn-success "} style={{width:'100%',height:"10vh"}} onClick={handleUploadClick} disabled={running}>Launch</Button></Col>
                            <Col xs={5}><Button className={"btn btn-danger "} style={{width:'100%',height:"10vh"}} disabled={!running}>Cancel</Button></Col>
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
                        <ProgressBars file_names={execVidName}></ProgressBars>
                        </Container>)
                    }

                <Container className={classes.blockContainer}>

                    <h4>Results</h4>
                    <Container>
                        {results.length > 0 && (
                            <Col>
                                {

                                    results.map(([id,vidName,duration], index) => (
                                    <Container key={id} onClick={(e,id)=>{handleVideoSelect(e,id,`http://localhost:5000/results/${vidName}`)}} className={'mx-0 px-0 bg-light-subtle'}>
                                        <Row >
                                            <Col xs={1}>
                                                <FaVideo height={'25px'}></FaVideo>

                                            </Col>
                                            <Col xs={6} >
                                                <p className={"text-left"}> {vidName.substring(10)}:</p>
                                            </Col>

                                            <Col xs={5} >
                                                <p className={"text-right"}>{duration.length>0?`${duration[0]}-${duration[1]}`:"None found"}</p>



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