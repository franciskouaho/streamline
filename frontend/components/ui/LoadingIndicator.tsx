import { View, ActivityIndicator, StyleSheet } from 'react-native';

export function LoadingIndicator() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ff7a5c" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
