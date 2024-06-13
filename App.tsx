import React, {useState, useRef, useEffect, useCallback} from 'react';
import {View, Image, Text, Dimensions} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {LogLevel, OneSignal} from 'react-native-onesignal';

OneSignal.initialize('07802ec1-70d7-40a2-a100-2c9aa05b1f1a');
OneSignal.Notifications.requestPermission(true);

interface MessageData {
  type: string;
  payload: any;
}

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: WebViewMessageEvent) => {
    const message: MessageData = JSON.parse(event.nativeEvent.data);

    if (message.type == 'login') OneSignal.login(message.payload.userId);
    if (message.type == 'logout') OneSignal.logout();
  };

  const handleReload = useCallback(() => {
    if (!webViewRef.current) return;

    setIsLoading(true); // Начало загрузки после перезагрузки
    setIsError(false); // Сброс флага ошибки перед перезагрузкой
    webViewRef.current.reload(); // Перезагрузка WebView
  }, [webViewRef]);

  const handleError = useCallback(() => {
    setIsLoading(false); // Завершение загрузки из-за ошибки
    setIsError(true); // Установка флага ошибки
  }, []);

  const handleLoadEnd = useCallback(() => {
    setTimeout(() => {
      setIsLoading(false); // Завершение загрузки
    }, 500);
  }, []);

  useEffect(() => {
    if (!isError) return;

    const timer = setTimeout(() => {
      handleReload(); // Повторная загрузка через 10 секунд после ошибки
    }, 3000); // 3 секунд
    return () => clearTimeout(timer); // Очищаем таймер при размонтировании компонента
  }, [isError]);

  const {width: screenWidth} = Dimensions.get('window');

  return (
    <View style={{flex: 1}}>
      <WebView
        ref={webViewRef}
        onMessage={handleMessage}
        onLoad={handleLoadEnd}
        onError={handleError}
        source={{uri: 'https://mobile.vt54.ru/'}}
        renderError={() => (
          <View
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#001E36',
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={require('./assets/logo/logo.png')}
              style={{
                width: screenWidth * 0.7,
                height: (296 / 933) * screenWidth * 0.7,
              }}
            />
          </View>
        )}
      />
      {!!(isLoading || isError) && (
        <View
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#001E36',
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={require('./assets/logo/logo.png')}
            style={{
              width: screenWidth * 0.7,
              height: (296 / 933) * screenWidth * 0.7,
            }}
          />
        </View>
      )}
    </View>
  );
};

export default App;
