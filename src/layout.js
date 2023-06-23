import {Container, ListGroup, ListGroupItem, Button, Row, Col, Navbar, Nav, Form, FormGroup} from "react-bootstrap";
import Progress from "./progress";
import React, { useState} from "react";
import { FaTrash, FaImage, FaVideo, FaCamera } from 'react-icons/fa';
import axios from "axios";
import VideoPlayer from "./videoPlayer";

//TODO: split this huge component into multiple components
export default function Layout(){
    //bootstrap formats
    const classes={
        fileListItem:" bg-light-subtle rounded mt-1",
        fileListItemSelected:"bg-secondary-subtle rounded mt-1 p-1",
        blockContainer:"bg-light rounded mt-1 p-1",
    }
    const [videoObjects, setVideoObjects] = useState([]);
    const [imageObjects, setImageObjects] = useState([]);
    let [imageID,setImageID]=useState(0);
    let [videoID,setVideoID]=useState(0);
    const [running, setRunning]=useState(false);
    const [selectedVideo, setSelectedVideo] = useState([-1,"start"]);
    const [results,setResults]=useState([]);
    //keys{id:0, name:"IMG_172.mp4", duration:[12,13],blob:request.data.blob()}
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
    const handleUploadClick = () => {
        const formData = new FormData();
        imageObjects.forEach(([id,image], index) => {
            console.log(`Uploading image ${image.name}`)
            console.log(image)
            formData.append(`image${index}`,image,image.name);
        });
        videoObjects.forEach(([id,video], index) => {
            console.log(`Uploading video ${video.name}`)
            console.log(video)
            formData.append(`video${index}`,video,video.name);
        });
        formData.append('num_images',imageObjects.length.toString())
        formData.append('num_videos',videoObjects.length.toString())
        setRunning(true)
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
                console.log(blobs)
            })

            .catch((error) => {
                console.log("Error caught")
                console.log(error)
                // Handle upload error
                setRunning(false);
            });

    };


    const handleVideoSelect = (e,id,video) => {
        console.log("Setting video state")
        console.log(video)
        setSelectedVideo([id,video]);
    };

    return (
        <>
            <Navbar bg="primary" variant="dark"  className="p-2">
                <Navbar.Brand style={{fontSize:"2rem"}}>Lost and Found</Navbar.Brand>
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
                                    //TODO: urgent: indexing is wrong when deleted
                                    // we should use a map instead
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
                        <Progress url={'http://localhost:5000/progress'}>
                        </Progress>

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
                <Container className={classes.blockContainer}>

                    <h4>Results</h4>
                    <Container>
                        {results.length > 0 && (
                            <Col>
                                {

                                    results.map(([id,vidName,duration], index) => (
                                    //TODO: urgent: indexing is wrong when deleted
                                    // we should use a map instead
                                    <Container key={id} onClick={(e,id)=>{handleVideoSelect(e,id,`http://localhost:5000/results/${vidName}`)}}>
                                        <Row >
                                            <Col xs={1}>
                                                <FaVideo height={'25px'}></FaVideo>

                                            </Col>
                                            <Col xs={4} >
                                                {vidName}
                                            </Col>

                                            <Col xs={4}>

                                                {duration.length>0?`${duration[0]}-${duration[1]}`:"None found"}

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