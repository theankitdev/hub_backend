import { Expo } from "expo-server-sdk";

const expo = new Expo();

const sendPushNotification = async (expoPushToken, title, body) => {
  try {
    const messages = [
      {
        to: expoPushToken,
        sound: "default",
        title,
        body,
      },
    ];

    await expo.sendPushNotificationsAsync(messages);
  } catch (error) {
    console.error(error);
  }
};

export default sendPushNotification;