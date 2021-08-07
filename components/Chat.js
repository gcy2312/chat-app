import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import MapView from "react-native-maps";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';

import CustomActions from './CustomActions';

import firebase from 'firebase';
import 'firebase/firestore';

export default function Chat({ navigation, route }) {
  //props from Start.js
  const { name, bgColor } = route.params;
  //hook for NetInfo
  const netInfo = useNetInfo();

  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyAh7j5Dtpj_Us872eSYy8QtZRaxKmzCktQ",
    authDomain: "chat-app-53c98.firebaseapp.com",
    projectId: "chat-app-53c98",
    storageBucket: "chat-app-53c98.appspot.com",
    messagingSenderId: "560035684319",
    appId: "1:560035684319:web:719c09355560ee8079ee6a"
  };

  //connect to firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  //reference the collection in firebase
  const refChatMessages = firebase.firestore().collection('messages');

  //Retrieve messages from firestore
  const getMessagesDB = () => {
    return refChatMessages.orderBy('createdAt', 'desc').onSnapshot((querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          _id: data._id,
          createdAt: data.createdAt.toDate(),
          text: data.text,
          user: data.user,
          image: data.image,
          location: data.location,
          system: data.system,
        });
      });
      setMessages(messages);
      saveMessages(messages); //Called here so that asyncstorage accurately reflects firebase store
    });
  };

  //Save a local copy of the messages array
  const saveMessages = async (messages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error(error);
    }
  };

  //Save user info locally
  const saveUser = async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error(error);
    }
  };

  //Retrieve local messages/user (used on initial mount/when offline)
  const loadLocalMessages = async () => {
    try {
      const savedMessages = await (AsyncStorage.getItem('messages') || []);
      const user = await (AsyncStorage.getItem('user') || {});
      setMessages(JSON.parse(savedMessages));
      setUser(JSON.parse(user));
    } catch (error) {
      console.error(error);
    }
  };

  //Auth via firebase
  const authenticateUser = () => {
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        setIsConnected(true);
        console.log('online');
        await firebase.auth().signInAnonymously();
      }

      const userData = {
        _id: user.uid,
        name: name,
        avatar: 'https://placeimg.com/140/140/any',
      };

      setUser(userData);
      console.log(userData);
      saveUser(userData);
      setIsConnected(false);
    });
  };

  //Adds message to firebase store
  const uploadMessage = (message) => {
    refChatMessages.add(message);
  };

  //Adds user's message to state and firebase store
  const onSend = useCallback((messages) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    //upload new message to Firestore
    uploadMessage(messages[0]);
  }, []);

  //Update title with user name -- useEffect to avoid component update warnings
  useEffect(() => navigation.setOptions({ title: `${name}'s Chatroom` }), [navigation, name]);

  //Authenticate and subscribes to Firestore on mount (reruns on netInfo change)
  useEffect(() => {
    loadLocalMessages();
    if (netInfo.isConnected) {
      //Run authentication and message requests and store returned unsub functions
      const authUnsubscribe = authenticateUser();
      const refUnsubscribe = getMessagesDB();

      //Unsubscribe on unmount
      return authUnsubscribe && refUnsubscribe;
    }
  }, [netInfo]);

  //adjust styling for bubbles
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
      // wrapperStyle={{
      //   right: {
      //     backgroundColor: '#bececb'
      //   },
      //   left: {
      //     backgroundColor: '#3c6c64'
      //   },
      // }}
      // textStyle={{
      //   right: {
      //     color: '#000',
      //   },
      // }}
      />
    )
  };

  //Custom render function so that input toolbar only appears while online
  const renderInputToolbar = (props) =>
    netInfo.isConnected === false
      ? null
      : <InputToolbar {...props} />;

  //if current message contains location - render map
  const renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  return (
    <View style={{
      flex: 1, justifyContent: 'space-evenly', flexDirection: 'column',
      //set Chat background color as color selected in Start page
      backgroundColor: bgColor
    }}
    >
      <GiftedChat
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={user}
      />

      {/* if android, add KeyboardAvoidingView component */}
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
      }
    </View>
  );



}



// const styles = StyleSheet.create({
//   container: {
//     width: 250,
//     height: 150,
//     borderRadius: 10,
//     margin: 5,
//     overflow: 'hidden',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
// });

// await addMessages().then({
          //   _id: uuid.v4(),
          //   system: true,
          //   text: `${name}` + ' has entered the chat',
          //   createdAt: new Date(),
          // });

