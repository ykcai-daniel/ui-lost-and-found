import {Container, ListGroup, ListGroupItem, Button, Row, Col, Navbar, Nav, Form, FormGroup} from "react-bootstrap";
import Progress from "./progress";
import React, {useState} from "react";

import { FaTrash, FaImage, FaVideo } from 'react-icons/fa';
import axios from "axios";


export default function Layout(){
    const [videos, setVideos] = useState([]);
    const [videoObjects, setVideoObjects] = useState([]);
    const [imageObjects, setImageObjects] = useState([]);
    const [running, setRunning]=useState(false);
    const handleVideoChange = (event) => {
        const files = event.target.files;
        const newVideos = [];
        setVideoObjects([...videoObjects,...event.target.files]);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = () => {
                const videoUrl = reader.result;
                const video = document.createElement('video');
                video.addEventListener('loadeddata', () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                    const previewUrl = canvas.toDataURL();
                    newVideos.push({ videoUrl, previewUrl });
                    if (newVideos.length === files.length) {
                        setVideos([...videos, ...newVideos]);
                    }
                });
                video.src = videoUrl;
                video.load();
            };

            reader.readAsDataURL(file);
        }
    };
    const handleVideoDelete = (index) => {
        const newVideos = [...videos];
        newVideos.splice(index, 1);
        setVideoObjects(videoObjects.splice(index,1));
        setVideos(newVideos);
    };
    const handleImageChange = (event) => {


        // for (let i = 0; i < files.length; i++) {
        //     const file = files[i];
        //     const reader = new FileReader();
        //     reader.onload = () => {
        //         const imageUrl = reader.result;
        //         newImages.push({ imageUrl });
        //         if (newImages.length === files.length) {
        //             setImages([...images, ...newImages]);
        //         }
        //     };
        //
        //     reader.readAsDataURL(file);
        // }
        setImageObjects([...imageObjects,...event.target.files])
    };
    //TODO: delete indexing
    const handleImageDelete = (index) => {
        //const newImages = [...images];
        //newImages.splice(index, 1);
        console.log("Before:")
        console.log(imageObjects)
        const deleted=imageObjects.splice(index,1)
        console.log("After:")
        console.log(deleted)
        setImageObjects(deleted);
        //setImages(newImages);
    };
    const handleUploadClick = () => {
        const formData = new FormData();
        imageObjects.forEach((image, index) => {
            console.log(`Uploading image ${image.name}`)
            console.log(image)
            formData.append(`image${index}`,image,image.name);
        });
        videoObjects.forEach((video, index) => {
            console.log(`Uploading video ${video.name}`)
            console.log(video)
            formData.append(`video${index}`,video,video.name);
        });
        formData.append('num_images',imageObjects.length.toString())
        formData.append('num_videos',videoObjects.length.toString())
        setRunning(true)
        axios.post('http://localhost:5000/upload', formData,{
            headers: {
                'content-type': 'multipart/form-data'
            }
        })
            .then((response) => {
                console.log(response.data)
                setRunning(false);
            })
            .catch((error) => {
                // Handle upload error
                setRunning(false);
            });
    };
    return (
        <>
            <Navbar bg="primary" variant="dark"  className="p-3">
                <Navbar.Brand style={{fontSize:"2rem"}}>Lost and Found</Navbar.Brand>
            </Navbar>
        <Row className={"gx-2"}>
            <Col xs={4}>
                <Container className={ "bg-light rounded m-3 p-2"}>
                    <p style={{fontSize: "1.2rem"}}>
                        Welcome to our project that utilizes YOLO v5 for lost and found at airports. Losing personal belongings while traveling can be a frustrating experience.
                        Our project aims to streamline this process by using YOLO v5, a state-of-the-art object detection algorithm,
                        to quickly and accurately identify lost items in airports.
                    </p>
                </Container>
                <Container className={ "bg-light rounded m-3 p-3"}>
                    <Container className={ "p-3"}>
                        <Row>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label><h3>Upload Images</h3></Form.Label>
                                <Form.Control disabled={running} type="file" multiple  variant="primary"  onChange={handleImageChange} />
                            </Form.Group>

                        </Row>

                    </Container>
                    <Container className={ "my-2"}>
                        {imageObjects.length > 0 && (
                            <Col>
                                {imageObjects.map((imageObj, index) => (

                                        <Container className={"p-3 mb-2 bg-light-subtle rounded"}>
                                            <Row key={index} className={'gx-0'}>
                                            <Col xs={1}>
                                                <Container >
                                                    <FaImage height={'25px'}></FaImage>
                                                </Container>

                                            </Col>
                                            <Col xs={10} >
                                                <h5>{imageObj.name}</h5>

                                            </Col>

                                            <Col xs={1}>

                                                    <Button onClick={() => handleImageDelete(index)}>
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
                <Container className={ "bg-light rounded m-3 p-3"}>
                    <Container className={ "p-3"}>
                        <Row>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Label><h3>Upload Videos</h3></Form.Label>
                                <Form.Control type="file" multiple  variant="primary"  onChange={handleVideoChange} disabled={running} />
                            </Form.Group>

                        </Row>

                    </Container>
                    <Container className={ "my-2"}>
                        {videoObjects.length > 0 && (
                            <Col>
                                {videoObjects.map((videoObj, index) => (

                                    <Container className={"p-3 mb-2 bg-light-subtle rounded"}>
                                        <Row key={index} className={'gx-0'}>
                                            <Col xs={1}>
                                                <Container >
                                                    <FaVideo height={'25px'}></FaVideo>
                                                </Container>

                                            </Col>
                                            <Col xs={10} >
                                                <h5>{videoObj.name}</h5>

                                            </Col>

                                            <Col xs={1}>

                                                <Button onClick={() => handleVideoDelete(index)}>
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
            <Col xs={4}>
                <Container className={'rounded m-3 p-4'}>
                    <Container className={'bg-light m-2 '} style={{ minHeight:"50vh"}}>
                        Video Player
                    </Container>
                    <Container className={'bg-light m-2'} style={{ minHeight:"20vh"}}>
                        Airport Floor Plan
                    </Container>
                </Container>

            </Col>
            <Col xs={4}>
                <Container className={'rounded m-3 p-4 bg-light'}>
                    <Container className={'rounded m-2 p-2 '}>
                        <Row >
                            <Col xs={9}><Button className={"btn btn-success "} style={{width:'100%',height:"10vh"}} onClick={handleUploadClick} disabled={running}><h2>Launch</h2></Button></Col>
                            <Col xs={3}><Button className={"btn btn-danger "} style={{width:'100%',height:"10vh"}} disabled={!running}><h4>Cancel</h4></Button></Col>
                        </Row>
                    </Container>
                    <Container>
                        <Progress url={'http://localhost:5000/progress'}>
                        </Progress>
                        <Container className={ "bg-light rounded m-1 p-4"}>
                            <Container className={ "m-2 p-1"}>
                                <h3>Configurations</h3>
                            </Container>
                            <Container className={ "p-1"}>
                                <Form>
                                    <Form.Group as={Row} className="mb-1" controlId="formPlaintextEmail">
                                        <Form.Label column >
                                            Lost Item Category
                                        </Form.Label>
                                            <Form.Control  defaultValue="suitcase" />
                                    </Form.Group>
                                </Form>
                            </Container>
                        </Container>
                        <Container className={ "bg-light rounded m-2 p-4"}>
                            <Container className={ "p-1"}>
                                <h3>Results</h3>
                            </Container>
                            <Container className={ "p-1"}>
                                <ListGroup>
                                    <ListGroupItem>
                                        Video 0: 0:31-0:36
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        Video 1: 3:22-3:27
                                    </ListGroupItem>
                                    <ListGroupItem>
                                        Video 2: 4:52-4:57
                                    </ListGroupItem>
                                </ListGroup>

                            </Container>
                        </Container>
                    </Container>
                </Container>
            </Col>
        </Row>
        </>
    )
}