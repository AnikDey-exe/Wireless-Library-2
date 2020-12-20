import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, TextInput, Image, Alert} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as firebase from 'firebase';
import db from '../config';

export default class BookTransactionScreen extends React.Component {
    constructor(){
      super();
      this.state={
        hasCameraPermissions: null,
        scan: false,
        scannedData: '',
        scannedStudentID: '',
        scannedBookID: '',
        buttonState: 'normal'
      }
    }
    
    getCameraPermission = async(ID) => {
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({
        hasCameraPermissions: status === "granted",
        buttonState: ID,
        scan: false
      })
    }

    handleBarCodeScanned = async({type, data}) => {
      const {buttonState} = this.state;
      if(buttonState === 'BookID') {
        this.setState({
          scanned: true,
          scannedBookID: data,
          buttonState: 'normal'
        })
      }
      else if(buttonState === 'StudentID'){
        this.setState({
          scanned: true,
          scannedStudentID: data,
          buttonState: 'normal'
        })
      }
    }

    handleTransaction = async() => {
      var transactionMessage;
      db.collection("books").doc(this.state.scannedBookID).get()
      .then((doc) => {
        var book = doc.data();
        if(book.bookAvailability) {
          this.initiateBookIssue();
          transactionMessage = "Book Issued";
        }
        else {
          this.initiateBookReturn();
          transactionMessage = "Book Returned";
        }
      })
    }

    initiateBookIssue = async() => {
      db.collection("transactions").add({
        'studentID': this.state.scannedStudentID,
        'bookID': this.state.scannedBookID,
        'date': firebase.firestore.TimeStamp.now().toDate(),
        'transactionType': "Issue"
      })

      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability': false
      })

      db.collection('students').doc(this.state.scannedStudentID).update({
        'booksIssued': firebase.firestore.FieldValue.increment(1)
      })

      Alert.alert("Book Issued");

      this.setState({
        scannedBookID: '',
        scannedStudentID: ''
      })
    }

    initiateBookReturn = async() => {
      db.collection("transactions").add({
        'studentID': this.state.scannedStudentID,
        'bookID': this.state.scannedBookID,
        'date': firebase.firestore.TimeStamp.now().toDate(),
        'transactionType': "Return"
      })

      db.collection("books").doc(this.state.scannedBookID).update({
        'bookAvailability': true
      })

      db.collection('students').doc(this.state.scannedStudentID).update({
        'booksIssued': firebase.firestore.FieldValue.increment(-1)
      })

      Alert.alert("Book Returned");

      this.setState({
        scannedBookID: '',
        scannedStudentID: ''
      })
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;
      if(buttonState !== "normal" && hasCameraPermissions) {
        return(
          <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          /> 
        );
      } 
      else if(buttonState === "normal") {
        return (
         <View style={styles.container}> 
            <View> 
              <Image 
               source={require('../assets/booklogo.jpg')}
               style={{width: 200, height: 200}}
              />
              <Text style={{textAlign: 'center',fontSize: 30}}> Library Master </Text>
            </View>
            <View style={styles.inputView}>
              <TextInput
               style={styles.inputBox}
               placeholder="Book ID"
               value={this.state.scannedBookID}
              />
              <TouchableOpacity
               style={styles.scanButton}
               onPress={()=>{
                 this.getCameraPermission('BookID');
               }}>
                 <Text style={styles.buttonText}> Scan </Text>
               </TouchableOpacity>
            </View>
            <View style={styles.inputView}> 
            <TextInput
               style={styles.inputBox}
               placeholder="Student ID"
               value={this.state.scannedStudentID}
              />
              <TouchableOpacity
               style={styles.scanButton}
               onPress={()=>{
                this.getCameraPermission('StudentID');
               }}>
                 <Text style={styles.buttonText}> Scan </Text>
               </TouchableOpacity>
            </View>
            <View> 
              <TouchableOpacity
               style={styles.submitButton}
               onPress={()=>{
                 this.handleTransaction();
               }}> 
                <Text style={styles.submitButtonText}> Submit </Text>
              </TouchableOpacity>
            </View>
         </View>
        );
      } 
    }
}

const styles = StyleSheet.create({
    scanButton:{
      backgroundColor: "black",
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    displayText: {
      color: "black",
      fontSize: 15,
    },
    buttonText:{
      color: "white",
      fontSize: 15,
      textDecorationLine: "underline"
    },
    container: {
      flex: 1,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center"
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,
      color: 'white'
    },
    inputView: {
      flexDirection: 'row',
      margin: 20 
    },
    inputBox: {
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    submitButton: {
      backgroundColor: 'black',
      width: 100,
      height: 50
    },
    submitButtonText: {
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    }
});
  