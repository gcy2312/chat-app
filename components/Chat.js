import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //state for name and background color (sent as props from Start page)
      name: this.props.route.params.name,
      bgColor: this.props.route.params.bgColor,
    }
  }

  render() {
    const { name } = this.state;

    //set username in navigation
    this.props.navigation.setOptions({ title: name });

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //set Chat background color as color selected in Start page
        backgroundColor: this.state.bgColor
      }}>
        <Text>Start Chatting!</Text>
      </View>
    );
  };
}

