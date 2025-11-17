<template>
  <div>
    <button @click="triggerVueSyncError">Vue 동기 오류 발생 </button>
    <button @click="triggerUnhandledRejection">Promise에서 catch 없이 발생하는 오류 발생</button>
    <button @click="triggerWindowError">Vue 컴포넌트 외부에서 발생하는 일반적인 JavaScript 런타임 오류 발생</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const triggerVueSyncError = () => {
  // 1. 이벤트 핸들러 내부에서 동기적 오류 발생
  // Vue는 이를 catch하여 app.config.errorHandler로 전달합니다.
  console.log("Triggering Vue Sync Error...");
  // 'undefinedVariable'은 정의되지 않은 변수입니다.
  // @ts-ignore
  const result = undefinedVariable + 10; 
};

const triggerUnhandledRejection = () => {
  console.log("Triggering Unhandled Rejection...");
  
  // catch() 블록이 없는 Promise에서 reject를 발생시킵니다.
  new Promise((_, reject) => {
    // 1초 후에 오류 발생
    setTimeout(() => {
      reject(new Error("Test Error: Unhandled Promise Rejection"));
    }, 1000);
  });

  // 또는 async 함수에서 throw하고 await를 걸지 않은 경우
  // async function fetchData() {
  //   throw new Error("Unhandled Rejection from Async Function");
  // }
  // fetchData(); // await 없이 호출
};

const triggerWindowError = () => {
  console.log("Triggering Window Global Error...");
  
  // setTimeout 내부의 동기 오류는 window.onerror로 포착됩니다.
  setTimeout(() => {
    // @ts-ignore
    const result = window.nonExistentFunction(); // 정의되지 않은 함수 호출
  }, 100);
};

onMounted(() => {
  // 2. 라이프사이클 훅 내부에서 오류 발생
  // @ts-ignore
  const data = someApiData.value.length; 
});
</script>