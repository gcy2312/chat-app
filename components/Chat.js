import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
// import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
// import { useNetInfo } from '@react-native-community/netinfo';
// import uuid from 'react-native-uuid';

import { View, Platform, KeyboardAvoidingView, Alert } from 'react-native';

import firebase from 'firebase';
import "firebase/firestore";

export default function Chat(props) {
  // const netInfo = useNetInfo();
  const bgColor = props.route.params.bgColor;
  const name = props.route.params.name;
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
  //listen for updates in Firebase DB
  const refMessages = firebase.firestore().collection('messages');

  //get stored messages from client's localStorage
  const getMessages = async () => {
    let messages = '';
    let user = '';
    try {
      //get data from asyncStorage
      messages = await AsyncStorage.getItem('messages') || [];
      user = await AsyncStorage.getItem('user');
      //set messages from asyncStorage
      setMessages(JSON.parse(messages));
      //set user from asyncStorage
      setUser(JSON.parse(user));
    } catch (error) {
      console.log(error.message);
    }
  };

  //save messages to client's local storage
  const saveMessages = async (messages) => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error(error);
    }
  };

  //save user data to local Storage
  const saveUser = async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error(error);
    }
  };

  //only for dev stages (delete messages from localStorage)
  const deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
      setMessages([]);
    } catch (error) {
      console.log(error.message);
    }
  };



  // Render real-time changes of collection with querySnapshot.
  const onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    //go through all docs in collection
    querySnapshot.forEach((doc) => {
      //save the fields for each document
      const data = doc.data();
      messages.push({
        _id: data._id,
        createdAt: data.createdAt.toDate(),
        text: data.text,
        user: data.user,
        image: data.image || null,
        location: data.location || null,
        //needed for system messages
        system: data.system || null,
      });
    });
    setMessages(messages); //set with updated data from Firestore
    saveMessages(messages); //save updated messages to localStorage
  };

  const onSend = (messages = []) => {
    //append new messages to chat screen
    setMessages((previousMessages) => GiftedChat.append(previousMessages.messages, messages));
    //add each new message (first in array) to DB
    addMessage(messages[0]);
    //save message to async storage
    saveMessages();
  };

  //save new messages in Firestore
  const addMessage = (message) => {
    refMessages.add({
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text,
      user: message.user,
    });
  };

  //styling for renderBubble
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

  }

  //if offline, no input toolbar
  const renderInputToolbar = (props) => {
    if (isConnected == false) {
    } else {
      return <InputToolbar {...props} />
    }
  };

  useEffect(() => {
    let authUnsubscribe = () => { };
    let unsubscribe = () => { };

    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        console.log('App Online');
        setIsConnected(true);

        authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }
          const userData = {
            _id: user.uid,
            name: name,
            avatar: 'https://placeimg.com/140/140/any',
          };
          setUser(userData);
          saveUser(userData);
          setMessages([]);
        });
        unsubscribe = refMessages.orderBy('createdAt', 'desc').onSnapshot(onCollectionUpdate);
      } else {
        //user offline
        console.log('app offline');
        setIsConnected(false);
        getMessages();
        Alert.alert('ChattApp is not connected. Cannot send new messages.');
      }
    });
    //unmount
    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);





  return (
    <View style={{
      flex: 1, justifyContent: 'center',
      //set Chat background color as color selected in Start page
      backgroundColor: bgColor
    }}
    >
      <GiftedChat
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
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
