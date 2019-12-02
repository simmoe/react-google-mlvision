const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');
const visionClient =  new vision.ImageAnnotatorClient();
let Promise = require('promise');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// Firestore uses an onCreate listener which allows for a function to be invoked when an event like adding a new photo to the collection happens

// The syntax allows us to check for any document in the photos collection by adding .document(‘photos/{document}

// 	snap gives back a snapshot of the data that was added, in this case the photo document that was added to the database, and context let’s us know what type of method is was, e.g. create, read, update destroy amongst other metadata

//we create a full photo url that the Google Vision API understands by recreating a google storage style url called photoUrl

// we then return a promise after going out to the google vision instance (visionClient) and using the webDetection method (there are a bunch more methods on this API such as labelDetection, faceDetection to name a couple that you might like to use instead which you can find here https://cloud.google.com/vision/docs/all-samples

// 	In this tutorial we are using the webDetection method, which picks up images that have similar attributes to the one uploaded (which we called photoUrl)

exports.addSimilarImages = functions.firestore.document('photos/{document}')
.onCreate((snap, context) => {

	console.log('SNAP', snap)
	console.log('CONTEXT', context)

	const data = snap.data();
	console.log('DATA IN IS', data)
	const photoUrl = "gs://" + data.bucket + "/" + data.fullPath;
	console.log('url is', photoUrl);

	return Promise.resolve()
	.then(() => {
		console.log('into functions...')
		return visionClient.webDetection(photoUrl);
	})
	.then(results => {
		console.log('VISION data all is: ', results)
		const webDetection = results[0].webDetection

		let similarImages = [];
 		if (webDetection.visuallySimilarImages.length) {
			webDetection.visuallySimilarImages.forEach(image => {
			 	similarImages.push(image);
			 });
		}		

		console.log('similarImages', similarImages)

		db.collection('photos').doc(context.params.document).update({ similarImages })
		return results
		.then(res => console.log('dopples added'))
		.catch(err => console.error(err));


	})
	.catch(err => console.error(err));

})


// If you get any errors, just make sure you are logged in to firebase by using firebase logout, then firebase login (then log in with the correct gmail account) and run firebase use default (which is found in your .firebaserc file — it’s most likely you haven’t changed this so you should see a default key in there). Make sure also that you’ve run yarn in your functions folder too as the module must be installed before deploying to Firebase. And if you get an error like the top part of the image above, just try it again. Magic.