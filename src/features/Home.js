import React, {useState, useEffect, useRef} from 'react'
import firebase from 'firebase'
import FileUploader from 'react-firebase-file-uploader'
import {FaCameraRetro, FaTrashAlt, FaCubes, FaTag} from "react-icons/fa"
import Similar from './Similar'
import Label from './Label'
import {ScaleLoader} from 'react-spinners'
import config from '../config/constants'

//init firebase
firebase.initializeApp(config);

const Home = (props) => {

    const [allPhotos,
        setAllPhotos] = useState([])

    const [loading,
        setLoading] = useState(false)

    const [similar,
        setSimilar] = useState([])

    const [labels,
        setLabels] = useState([])

    //upload functions
    const photosDiv = useRef()

    const handleUploadStart = () => {
        setLoading(true)
    }

    const handleUploadError = () => {
        //not implemented
    }
    const handleProgress = () => {
        //not implemented
    }
    async function handleUploadSuccess(filename) {
        try {
            let {bucket, fullPath} = await firebase
                .storage()
                .ref('images')
                .child(filename)
                .getMetadata();
            console.log('bucket', bucket)
            console.log('fullPath', fullPath)
            let downloadURL = await firebase
                .storage()
                .ref('images')
                .child(filename)
                .getDownloadURL();
            console.log('downloadURL', downloadURL)

            let {uid, email, displayName} = await firebase
                .auth()
                .currentUser;

            let newPhoto = {
                url: downloadURL,
                userName: displayName,
                userId: uid,
                email,
                bucket,
                fullPath
            }

            await firebase
                .firestore()
                .collection('photos')
                .add(newPhoto)
            setLoading(false)
        } catch (err) {
            console.error(err);
        }
    }

    async function deletePhoto(photo) {
        console.log('deleting photo with id', photo.id)
        try {
            await firebase
                .firestore()
                .collection('photos')
                .doc(photo.id)
                .delete();
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        firebase
            .auth()
            .onAuthStateChanged(user => {
                if (user) {
                    firebase
                        .firestore()
                        .collection('photos')
                        .onSnapshot(snapshot => {
                            let photos = [];
                            snapshot.forEach(doc => {
                                var newItem = doc.data();
                                newItem.id = doc.id;
                                photos.push(newItem);
                            })
                            setAllPhotos(photos)
                        })
                }
            })
    }, [similar])
    // the additional argument [similar] makes useEfeect run only when some value is
    // set - here, the state variable similar

    const takeMeAway = (url) => {
        setSimilar(similar.filter((b) => b.url !== url))
    }

    return (
        <div className='home'>
            <div className='header'>
                <div className='title'>
                    <h1>Similar images</h1>
                    <p>Upload a new, or click an existing image, to see simlar images.</p>
                </div>
                <div className="loader">
                    <label>
                        <FaCameraRetro title='upload new' className="upload-icon" size={32}/>
                        <FileUploader
                            hidden
                            accept="image/*"
                            storageRef={firebase
                            .storage()
                            .ref('images')}
                            onUploadStart={handleUploadStart}
                            onUploadError={handleUploadError}
                            onUploadSuccess={handleUploadSuccess}
                            onProgress={handleProgress}/>
                    </label>
                </div>
            </div>
            <main>
                <div className='my-photos' ref={photosDiv}>
                    {allPhotos.map((photo, i) => {
                        return (
                            <div key={i} className='photo'>
                                <img key={i} src={photo.url} alt={photo.id}/>
                                <div className="icons">
                                    <FaCubes title="view similar" onClick={() => setSimilar(photo.similarImages)}/>
                                    <FaTag title="view labels" onClick={() => setLabels(photo.labels)}/>
                                    <FaTrashAlt title="delete photo" onClick= { () => deletePhoto(photo) }/>
                                </div>
                            </div>
                        )
                    })}
                    {loading
                        ? <ScaleLoader color={'#000'} loading={true}/>
                        : ''}
                </div>
                <div className="similarImagesDiv">
                    {labels.length > 0 && labels.map((label, i) => <Label key={i} label={label}/>)}
                    {similar.length > 0 && similar.map((photo, i) => <Similar takeMeAway={takeMeAway} key={i} image={photo}/>)}
                </div>

            </main>
        </div>
    )
}

export default Home