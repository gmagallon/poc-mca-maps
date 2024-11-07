
import React, {useState} from "react";
import {Button, TextInput, View} from "react-native";
import {Colors} from "react-native/Libraries/NewAppScreen";

export default function SearchBox({onSearch, onCancel}) {
  const [searchBoxText, setSearchBoxText] = useState<string>("");

  return (
      <View  style={{flexDirection: 'row'}}>
        <TextInput
            enterKeyHint={'search'}
            value={searchBoxText}
            onChangeText={setSearchBoxText}
            onSubmitEditing={(event) => onSearch(event.nativeEvent.text)}
            placeholder={'Search...'} placeholderTextColor={'#AAA'}
            style={{
              height: 48,
              backgroundColor: Colors.white,
              borderColor: Colors.dark,
              borderWidth: 1,
              paddingHorizontal: 5,
              flex: 1,
              color: Colors.dark
            }}
        />
        <Button title={'Search'} onPress={() => onSearch(searchBoxText)}/>
        <Button title={'Cancel'} onPress={() => onCancel()}/>
      </View>
  );
}
