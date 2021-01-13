/*
 * @Descripttion: 
 * @Date: 2021-01-13 13:59:16
 * @LastEditTime: 2021-01-13 16:44:55
 * @Author: Kiki
 */
/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BF6OdxHUjeLUPG4UdSJAPxmPxDVQFT8CG3O1ylsUrPMg_vDY6u5pdp-Mts1KKBhLvViiNCU9_JBxqjEj0uwvd-Q';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
//浏览器是否支持服务工作线程和推送消息，如果支持，它便会注册我们的 sw.js 文件
if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
  
    navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);
  
      swRegistration = swReg;
      initialiseUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

  /**
   * @description: 检查用户当前有没有订阅
   * getSubscription() 方法可以在存在订阅时返回可使用当前订阅解析的 promise，否则，返回 null
   */
  function initialiseUI() {
    // Set the initial subscription value
    //添加点击侦听器
    pushButton.addEventListener('click', function() {
        pushButton.disabled = true;
        if (isSubscribed) {
          // TODO: Unsubscribe user
        } else {
          subscribeUser();
        }
      });
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = !(subscription === null);
  
      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }
      updateBtn();
    });
  }
  // 启用按钮
  function updateBtn() {
      console.log('fff',Notification.permission === 'denied')
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
      }
    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }
  
    pushButton.disabled = false;
  }
 //订阅用户，这个过程就是从网页向后端发送订阅，然后后端通过对订阅中的端点实施 API 调用，进而触发推送消息。
  function subscribeUser() {
    //获取应用服务器的公钥，转换为 UInt8Array
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    //userVisibleOnly 参数基本上就表示承认您会在发送推送时显示通知
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {
      console.log('User is subscribed:', subscription);
  
      updateSubscriptionOnServer(subscription);
  
      isSubscribed = true;
  
      updateBtn();
    })
    .catch(function(err) {
      console.log('Failed to subscribe the user: ', err);
      updateBtn();
    });
  }
  //实际应用中可以使用此方法将订阅发送到后端
  function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server
  
    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');
  
    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      subscriptionDetails.classList.remove('is-invisible');
    } else {
      subscriptionDetails.classList.add('is-invisible');
    }
  }
    //点击取消订阅用户
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });
  //取消订阅
  function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log('Error unsubscribing', error);
    })
    .then(function() {
      updateSubscriptionOnServer(null);
  
      console.log('User is unsubscribed.');
      isSubscribed = false;
  
      updateBtn();
    });
  }