import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, selectedColor, onSelectColor }) => {
  return (
    <View style={styles.container}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            selectedColor === color && styles.selectedColor
          ]}
          onPress={() => onSelectColor(color)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 10,
    gap: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
});

export default ColorPicker;
