import { ImageBackground, SafeAreaView } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView className={styles.container}>
      <ImageBackground
        className={styles.background}
        resizeMode="stretch"
        source={require('~/assets/backgrounds/background1.png')}>
        {children}
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = {
  container: 'flex flex-1',
  background: 'flex flex-1 p-6 bg-white',
};
