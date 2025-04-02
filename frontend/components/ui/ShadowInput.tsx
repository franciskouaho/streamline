import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { shadowStyles } from '@/constants/CommonStyles';

interface ShadowInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    style?: any;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: any;
    autoComplete?: any;
}

export const ShadowInput = ({ style, ...props }: ShadowInputProps) => {
    return (
        <TextInput 
            style={[styles.input, shadowStyles.input, style]}
            placeholderTextColor="#666"
            {...props}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        fontSize: 16,
    },
});
