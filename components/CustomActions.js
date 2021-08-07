import React from 'react';
import { StyleSheet } from 'react-native';
import { Actions } from 'react-native-gifted-chat';

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import firebase from 'firebase';
import 'firebase/firestore';

export default function CustomActions(props) {

  //Allows user to upload image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync().catch(
        (error) => console.log(error)
      );

      if (!result.cancelled) {
        const imageURL = await uploadImage(result.uri);
        props.onSend({ image: imageURL });
      }
    }
  };

  //Allows user to upload photo via camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync();

      if (!result.cancelled) {
        const imageURL = await uploadImage(result.uri);
        props.onSend({ image: imageURL });
      }
    }
  };

  //Sends user's location
  const sendLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      const result = await Location.getCurrentPositionAsync({});

      if (result) {
        props.onSend({
          location: {
            longitude: result.coords.longitude,
            latitude: result.coords.latitude,
          },
        });
      }
    }
  };

  //Uploads image to firestore and returns url
  const uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = (error) => {
        console.error(error);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('get', uri, true);
      xhr.send(null);
    });

    const filePath = uri.split('/');
    const imageName = filePath[filePath.length - 1];

    const ref = firebase.storage().ref().child(`images/${imageName}`);

    const snapshot = await ref.put(blob);

    blob.close();

    return await snapshot.ref.getDownloadURL();
  };

  return (
    <Actions
      {...props}
      containerStyle={styles.container}
      options={{
        'Choose From Library': pickImage,
        'Take Picture': takePhoto,
        'Send Location': sendLocation,
        Cancel: () => { },
      }}
      accessibile={true}
      accessibilityLabel='actions menu'
      accessibilityHint='Select from menu to send a picture from device library, take a picture, or send location'
      accessibilityRole='menu'
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },

  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2b2',
    borderWidth: 2,
    flex: 1,
  },

  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});