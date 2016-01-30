/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  View,
  ListView,
  ScrollView,
  ViewPagerAndroid,
  TouchableOpacity
} from 'react-native';

import SmsAndroid from 'react-native-sms-android';
import Contacts from 'react-native-contacts'

import {Sockets} from './core/Sockets';


var AndroidSms = require('react-native-android-sms');

class androidDevicesServices extends Component {

  constructor() {
    super()
    console.log('super')

    this.sockets = new Sockets({});
    this.sockets.onopen = () => {
      this.setState({
        wsStatus : 'Connected'
      })

      Contacts.getAll((err, contacts) => {
        if (err) {
          return this.sockets.emit('error', err)
        }
        this.sockets.emit('contacts', contacts)
        this.setState({
          syncHistory : [ ...this.state.syncHistory, 'sync contacts']
        })
      })
    }

    this.sockets.onmessage = (e) => {
      this.setState({
        wsStatus : 'test' + e
      })
    }

    this.sockets.on('sms', (d) => {
      this.setState({
        wsStatus : 'message: ' + JSON.stringify(d),
        smsHistory : [ ...this.state.smsHistory, d.tel ]
      })


      SmsAndroid.sms(d.tel, d.msg, 'sendDirect', (err, msg) => { })
    })

    this.sockets.onerror = (e) => {
      this.setState({
        wsStatus : 'Error: ' + e.message
      })
    }

    var lastID = false;

    setInterval(() => {
      AndroidSms.list(JSON.stringify({address: '+33648133454'}), (fail) => {
          console.log("OH Snap: " + fail)
      },
      (count, smsList) => {
          var arr = JSON.parse(smsList);
        //  console.log('last id', lastID)
          for (var i = 0; i < arr.length; i++) {
            if (!lastID) {
              console.log('last', arr[i]);
            }
            if (arr[i]._id > lastID) {
              console.log('new', arr[i]);
            }


          }
          lastID = arr[0]._id || false;
      });
    }, 1000)



    this.state = {
      onx : 'rien',
      wsStatus : 'Starting',
      phone_name : 'test',
      smsHistory : [],
      syncHistory : [],
    }


  }

  componentDidMount() {
    console.log('componentDidMount')

  }


  sendContacts() {
    Contacts.getAll((err, contacts) => {
      if (err) {
        return this.sockets.emit('error', err)
      }
      this.sockets.emit('contacts', contacts)
      this.setState({
        syncHistory : [ ...this.state.syncHistory, 'sync contacts']
      })
    })
  }

  render() {
    console.log('render !')
    return (
      <ViewPagerAndroid
      style={styles.viewPager}
      initialPage={0}>
        <View style={styles.pageStyle}>
          <Text style={styles.welcome}>
            Welcome to Alpha SMS !
          </Text>
          <Text style={styles.instructions}>
            Websocket Status: {this.state.wsStatus}
          </Text>

          <TextInput
            style={{ borderColor: 'gray', borderWidth: 1 }}
            onChangeText={(text) => this.setState({phone_name : text})}
            value={this.state.phone_name}
          />

        <View style={{flexDirection : 'row', borderWidth: 1, borderRadius: 3, height : 200,alignSelf: 'stretch', flexWrap : 'wrap' }}>

          <View style={{ flex: 1, alignItems  : 'center' }}>
            <Text style={{fontSize : 25 }}>Actions</Text>
            {(this.state.smsHistory).map((e, index) => {
              return <Text key={index}>sms to {e}</Text>
            })}
          </View>

          <ScrollView horizontal={false} style={{ flex: 1, height : 197, backgroundColor: '#eaeaea'}}>
            <Text style={{fontSize : 25 }}>Sync</Text>
            {(this.state.syncHistory).map((e, index) => {
              return <Text key={index}>{e}</Text>
            })}
          </ScrollView>

        </View>
        </View>
        <View style={styles.pageStyle}>
          <Text style={{fontSize : 25 }}>My data</Text>


          <TouchableOpacity onPress={ this.sendContacts.bind(this) }>
            <View style={styles.email}>
              <Text style={styles.text}>Sync Contacts</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ViewPagerAndroid>
    );
  }
}

const styles = StyleSheet.create({
  viewPager: {
    flex: 1,
  },
  pageStyle: {
    alignItems: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  email: {
    flex: 33,
    justifyContent: 'center',
  },
  sms: {
    flex: 33,
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
  },
});

AppRegistry.registerComponent('androidDevicesServices', () => androidDevicesServices);
