import React from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { View, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { AsyncStorage } from 'react-native';
// import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';
import uuid from 'react-native-uuid';

import CustomActions from './CustomActions';
// import MapView, { Marker } from 'react-native-maps';
import MapView from "react-native-maps";



import firebase from 'firebase';
import "firebase/firestore";

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
    }

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
    this.referenceChatMessages = null;
  }

  // allows offline access to messages retrieved from client-side storage 
  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: `${name}'s Chatroom` });
    this.getMessages();

    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
        this.setState({ isConnected: true });
        // reference the collection in firebase
        this.referenceChatMessages = firebase.firestore().collection("messages");
        // authenticate user
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }
          this.setState({
            uid: user.uid,
            user: {
              _id: user.uid,
              name: name,
              avatar: 'https://placeimg.com/140/140/any',
            },
            messages: [],
          });
          console.log(user);
          await this.addMessages({
            _id: uuid.v4(),
            system: true,
            text: `${name}` + ' has entered the chat',
            createdAt: new Date(),
          });

          // listen for collection changes for current user
          this.unsubscribe = this.referenceChatMessages
            .orderBy("createdAt", "desc")
            .onSnapshot(this.onCollectionUpdate);
        });
      } else {
        console.log('offline');
        this.setState({ isConnected: false });
        Alert.alert('No internet connection. Unable to send messages.');
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();
  }

  //when something changes in the messages
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || null,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || null,
        location: data.location || null,
        system: data.system || null,
      });
    });
    this.setState({
      messages,
    });
  };

  // Adds messages to cloud storage
  addMessages = (message) => {
    firebase.firestore().collection("messages")
      .add({
        _id: message._id,
        text: message.text || null,
        createdAt: message.createdAt,
        image: message.image || null,
        location: message.location || null,
        user: message.user || null,
        uid: this.state.uid,
        system: message.system || null,
      })
      .catch((error) => console.log("error", error));
  };

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      //save message to firestore using addMessages function when onSend prop called
      () => {
        this.addMessages(this.state.messages[0]);
        this.saveMessages();
      });
  }

  //adjust styling for bubbles
  renderBubble(props) {
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

  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return (
        <InputToolbar
          {...props}
        />
      );
    }
  }

  //if current message contains location - render map
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      // const coords = {
      //   latitude: currentMessage.location.latitude,
      //   longitude: currentMessage.location.longitude,
      // };
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

  render() {
    const bgColor = this.props.route.params.bgColor;

    return (
      <View style={{
        flex: 1, justifyContent: 'center',
        //set Chat background color as color selected in Start page
        backgroundColor: bgColor
      }}
      >
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
        />

        {/* if android, add KeyboardAvoidingView component */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>
    );
  };
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

