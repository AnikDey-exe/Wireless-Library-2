import * as firebase from 'firebase/app';

require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyA7-WCklXKmgkSNRXMdrDIvRjU4rgPXezo",
    authDomain: "library-master-4d58b.firebaseapp.com",
    projectId: "library-master-4d58b",
    storageBucket: "library-master-4d58b.appspot.com",
    messagingSenderId: "553611507333",
    appId: "1:553611507333:web:3644d69f6435ad2490dbec"
}

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();