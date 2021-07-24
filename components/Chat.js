import React from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from 'react-native';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //state for name and background color (sent as props from Start page)
      name: this.props.route.params.name,
      bgColor: this.props.route.params.bgColor,
      messages: [],
    }
  }

  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer. Welcome to ChatApp!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: this.state.name + ' has entered the chat',
          createdAt: new Date(),
          system: true,
        },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  //adjust styling for bubbles
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#bececb'
          },
          left: {
            backgroundColor: '#3c6c64'
          }
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
    const { name } = this.state;

    //set username in navigation
    this.props.navigation.setOptions({ title: name });

    return (
      <View style={{
        flex: 1, justifyContent: 'center',
        //set Chat background color as color selected in Start page
        backgroundColor: this.state.bgColor
      }}
      >
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />

        {/* if android, add KeyboardAvoidingView component */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>
    );
  };
}

