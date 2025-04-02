import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { shadowStyles } from '@/constants/CommonStyles';

interface ShadowButtonProps {
    onPress: () => void;
    title: string;
    style?: any;
    textStyle?: any;
}

export const ShadowButton = ({ onPress, title, style, textStyle }: ShadowButtonProps) => {
    return (
        <TouchableOpacity 
            style={[styles.button, shadowStyles.button, style]} 
            onPress={onPress}
        >
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#ff7a5c',
        width: '100%',
        borderRadius: 15,
        padding: 18,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
