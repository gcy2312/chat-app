import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, TextInput, TouchableOpacity, ImageBackground } from 'react-native';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      bgColor: '#757083'
    }
  }
  render() {
    let { bgColor } = this.state

    return (
      <View style={{ flex: 1, flexDirection: 'column', }}>
        <ImageBackground source={require('../assets/background-image.png')} resizeMode="cover" style={styles.image}>

          <View style={styles.main}>
            <Text style={styles.title}>Chat Me Up</Text>
          </View>

          <View style={styles.chatSelect}>
            <TextInput
              style={styles.nameField}
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}
              placeholder='Your name...'
            />
            <View style={styles.colorBox}>
              <Text style={styles.bgColorText}>
                Choose a background color:
              </Text>

              <View style={styles.bgColors}>
                <TouchableOpacity style={styles.bgColor1}
                  onPress={() => this.setState({ bgColor: '#090C08' })} />
                <TouchableOpacity style={styles.bgColor2}
                  onPress={() => this.setState({ bgColor: '#474056' })} />
                <TouchableOpacity style={styles.bgColor3}
                  onPress={() => this.setState({ bgColor: '#8A95A5' })} />
                <TouchableOpacity style={styles.bgColor4}
                  onPress={() => this.setState({ bgColor: '#B9C6AE' })} />
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, bgColor: this.state.bgColor })}
            >
              <Text style={styles.btnText}>Start Chatting</Text>
            </TouchableOpacity>



          </View>

        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  main: {
    flex: 0.5,
  },
  title: {
    fontSize: 45,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    top: 30,
    height: 50,
  },
  chatSelect: {
    flex: 0.44,
    backgroundColor: '#ffffff',
    width: '88%',
    padding: '5%',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  nameField: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 2,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 0.5,
    flex: 0.33,
  },
  colorBox: {
    flexDirection: 'column',
    flex: 0.33,
    paddingBottom: '5%',
  },
  bgColors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bgColorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    // opacity: '100%',
  },
  bgColor1: {
    backgroundColor: '#090c08',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  bgColor2: {
    backgroundColor: '#474056',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  bgColor3: {
    backgroundColor: '#8a95a5',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  bgColor4: {
    backgroundColor: '#b9c6ae',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  button: {
    height: 60,
    backgroundColor: '#757083',
    // paddingTop: '5%',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 60,
  },
});