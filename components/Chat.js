import React from 'react';
import { StyleSheet, View, Text } from 'react-native';



export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.route.params.name,
      bgColor: this.props.route.params.bgColor,
    }
  }

  render() {
    const { name } = this.state;
    // const { name, bgColor } = route.params;

    // let bgColor = this.props.route.params.bgColor;
    // const backColor = JSON.stringify(bgColor);

    this.props.navigation.setOptions({ title: name });

    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: this.state.bgColor
      }}>
        <Text>Start Chatting!</Text>
      </View>
    );
  };
}

