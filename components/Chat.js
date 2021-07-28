import React from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

import { View, Platform, KeyboardAvoidingView } from 'react-native';

import firebase from 'firebase';
import "firebase/firestore";


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: null,
      }
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


  componentDidMount() {
    //reference the collection in firebase
    this.referenceChatMessages = firebase.firestore().collection("messages");
    //authenticate user
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }

      //reference to users chat collection
      this.referenceChatMessages = firebase.firestore().collection("messages");
      // listen for collection changes for current user
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);

    });
    // const name = this.props.route.params.name;
    // this.setState({
    //   messages: [
    //     {
    //       _id: 2,
    //       text: `${name}` + ' has entered the chat',
    //       createdAt: new Date(),
    //       system: true,
    //     },],
    // });
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
        text: data.text,
        createdAt: new Date(),
        user: {
          _id: data.user._id,
          name: data.user.name,
        },
      });
    });
    const name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: `${name}'s Chatroom` });
    this.setState({
      messages,
    });
  };

  // Adds messages to cloud storage
  addMessages = () => {
    const messages = this.state.messages[0];
    firebase.firestore().collection("messages")
      .add({
        _id: messages._id,
        text: messages.text,
        createdAt: messages.createdAt,
        user: {
          _id: messages.user._id,
          name: messages.user.name,
        },
      })
      .then()
      .catch((error) => console.log("error", error));
  };

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      //save message to firestore using addMessages function when onSend prop called
      () => {
        this.addMessages();
      });

  }


  //adjust styling for bubbles
  renderBubble(props) {
    // let name = this.props.route.params.name;
    // const messages = this.state.messages[0];
    // let userName = messages.user.name;
    return (
      <Bubble
        {...props}
        // position={name === userName ? 'right' : 'left'}
        wrapperStyle={{
          right: {
            backgroundColor: '#bececb'
          },
          left: {
            backgroundColor: '#3c6c64'
          },
        }}
        textStyle={{
          right: {
            color: '#000',
          },
        }}

      />
    )
  }

  render() {
    const name = this.props.route.params.name;
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
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
            name: name,
          }}

        />

        {/* if android, add KeyboardAvoidingView component */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>
    );
  };
}

