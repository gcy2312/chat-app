import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Alert } from 'react-native';

const colorChoices = ['#090C08', '#474056', '#8A95A5', '#B9C6AE']

export default function Home(props) {
  [name, setName] = useState('');
  [bgColor, setBgColor] = useState('');

  const handlePressChat = (name, bgColor) => {
    name === '' && bgColor === ''
      ? Alert.alert(
        'Please enter a username and select a background color to continue.',
      )
      : name === ''
        ? Alert.alert(
          'Please enter a username to continue.',
        )
        : bgColor === ''
          ? Alert.alert(
            'Please select a background color to continue.',
          )
          : props.navigation.navigate('Chat', {
            name,
            bgColor,
          });
  };

  return (
    <View style={{ flex: 1, flexDirection: 'column', }}>
      <ImageBackground
        source={require('../assets/background-image.png')}
        resizeMode="cover"
        style={styles.image}
        accessibile={true}
        accessibilityLabel='Background Image'
        accessibilityHint='Blurred image of people talking and laughing'
        accessibilityRole='image'
      >

        <View style={styles.main}>
          <Text style={styles.title}
            accessibile={true}
            accessibilityLabel='App Title'
            accessibilityHint='Display text ChatApp'
            accessibilityRole='text'
          >ChatApp</Text>
        </View>

        <View style={styles.chatSelect}>
          <TextInput
            style={styles.nameField}
            onChangeText={(name) => setName(name)}
            value={name}
            placeholder='Your name...'
            accessibile={true}
            accessibilityLabel='Username Input'
            accessibilityHint='Enter name here, and it will be displayed in Chat screen'
          />
          <View style={styles.colorBox}>
            <Text style={styles.bgColorText}>
              Choose a background color:
            </Text>

            <View style={styles.bgColors}>
              {colorChoices.map((uColor) => (
                <TouchableOpacity
                  key={uColor}
                  style={[
                    styles.shadow,
                    styles.selectColor(uColor),
                    bgColor === uColor ? styles.circle : null,
                  ]}
                  onPress={() => setBgColor(uColor)}
                  accessibile={true}
                  accessibilityLabel='Select background color'
                  accessibilityHint='Color selected will be background color in Chat screen'
                  accessibilityRole='menuitem'
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePressChat(name, bgColor)}
            accessibile={true}
            accessibilityLabel='Start Chatting'
            accessibilityHint='Click button to enter Chat'
            accessibilityRole='button'
          >
            <Text style={styles.btnText}>Start Chatting</Text>
          </TouchableOpacity>

        </View>

      </ImageBackground>

      {/* if android, add KeyboardAvoidingView component */}
      {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
      }
    </View>
  );
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
    height: 60,
  },
  chatSelect: {
    flex: 0.45,
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
    paddingBottom: '2%',
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  selectColor: (uColor) => ({
    backgroundColor: uColor,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
    paddingBottom: '1%',
  }),
  circle: {
    borderWidth: 3,
    borderColor: '#777772',
  },
  button: {
    height: 60,
    backgroundColor: '#757083',
    paddingTop: '1%',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 60,
  },
});