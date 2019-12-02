import React, {useState, useEffect, useRef} from 'react'
import firebase from 'firebase'
import FileUploader from 'react-firebase-file-uploader'
import {FaCameraRetro, FaTrashAlt} from "react-icons/fa"
import Similar from './Similar'
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

    return (
        <div className='home'>
            <div className='header'>
                <div className='title'>
                    <h1>Similar images</h1>
                    <p>Upload a new, or click an existing image, to see simlar images.</p>
                </div>
                <div className="loader">
                    <label>
                        <FaCameraRetro size={44}/>
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
                                <img
                                    onClick={() => setSimilar(photo.similarImages)}
                                    key={i}
                                    src={photo.url}
                                    alt={photo.id}/>
                                <FaTrashAlt onClick= { () => deletePhoto(photo) }/>
                            </div>
                        )
                    })}
                    {loading
                        ? <ScaleLoader color={'#000'} loading={true}/>
                        : ''}
                </div>
                <div className="similarImagesDiv">
                    {similar.map((photo, i) => <Similar key={i} image={photo}/>)}
                </div>
            </main>
        </div>
    )
}

export default Home