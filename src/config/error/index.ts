import { type App } from 'vue'

interface Error {
  error: string;
  stack?: string;
  component: string;
  info: string;
  url: string;
  userAgent: string;
}

// 1. 디바운스를 위한 타이머 ID
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
// 2. 최근에 발생한 오류를 기록하여 중복을 방지
let lastLoggedError: string | null = null;
// 3. 동일 오류 무시 시간 (5초)
const IGNORE_DURATION_MS = 5000;
// 4. 디바운스 시간 (3초에 한 번만 실제 API 호출)
const DEBOUNCE_DURATION_MS = 3000;
// 5. 짧은 시간 내에 누적된 오류들을 저장할 배열
const errorQueue: Error[] = [];

async function sendErrorToBackend(errorData: Error): Promise<void> {
  console.log('Error payload prepared for backend:', errorData);
  
  const currentErrorKey = `${errorData.component}|${errorData.error.substring(0, 100)}`;

    // 1. 🛑 동일 오류 중복 체크 (5초 내에 같은 오류가 났다면 무시)
    if (lastLoggedError === currentErrorKey) {
      console.warn('Suppressing duplicate error:', errorData.error);
      return;
    }

    // 2. 큐에 오류 추가 및 디바운스 타이머 설정
    errorQueue.push(errorData);
    
    // 타이머가 설정되어 있다면 초기화
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // 3. 새로운 타이머 설정: DEBOUNCE_DURATION_MS 후에 실제 전송 함수 호출
    debounceTimer = setTimeout(() => {
      // 타이머 만료 시, 누적된 오류들을 전송하고 상태 초기화
      processErrorQueueAndSend();
    }, DEBOUNCE_DURATION_MS);
}

async function processErrorQueueAndSend(): Promise<void> {
    // 큐가 비어있거나, 이미 처리 중인 경우 방지
    if (errorQueue.length === 0) {
      return;
    }

    // 현재 큐에 있는 모든 오류를 가져와서 비웁니다.
    const errorsToSend = [...errorQueue];
    errorQueue.length = 0; // 큐 비우기
    
    // 4. 상태 업데이트: 현재 처리하는 오류를 '마지막 로그된 오류'로 기록
    // 큐의 첫 번째 오류를 대표 오류로 사용
    const representativeError = errorsToSend[0];
    lastLoggedError = `${representativeError.component}|${representativeError.error.substring(0, 100)}`;

    // 5. 동일 오류 무시 타이머 설정
    setTimeout(() => {
      // 5초 후, 마지막 로그된 오류 상태를 초기화하여 다시 동일 오류를 받도록 허용
      lastLoggedError = null;
    }, IGNORE_DURATION_MS);

    // -----------------------------------------------------------
    // 6. 백엔드 전송을 위한 Payload 준비
    // 짧은 시간 내에 여러 오류가 쌓였을 경우, 이를 하나의 로그로 그룹화합니다.
    // -----------------------------------------------------------
    const userStore = useUserStore()
    const { user } = storeToRefs(userStore)
    const memberId = user.value.memberId || 0

    const payloads = errorsToSend.map((error, index) => {
      return {
        memberId: memberId,
        errorCode: error.info,
        site: 'Frontend',
        errorMessage: `${error.component}: ${error.error}`,
        stackTrace: error.stack,
        regId: memberId
      }
    })
    
    try {
      console.log('Payloads : ', payloads)
      await $http({
        url: transactionConfig.log.error.url,
        method: 'post',
        data: payloads
      })
      console.log('success')
    } catch (apiError) {
      console.error('❌ Failed to log frontend error to backend API:', apiError);
    }
}

function addErrorEvent() {
  // Promise에서 catch 없이 발생하는 오류 처리
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    event.preventDefault(); // 일부 브라우저에서 기본 콘솔 로그 방지
    console.error('❌ [Window Unhandled Rejection]', event.reason);

    const errorReason = event.reason instanceof Error ? event.reason.message : String(event.reason);
    const errorStack = event.reason instanceof Error ? event.reason.stack : undefined;

    sendErrorToBackend({
      error: `Unhandled Promise Rejection: ${errorReason}`,
      stack: errorStack,
      component: 'N/A',
      info: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });

  // Vue 컴포넌트 외부에서 발생하는 일반적인 JavaScript 런타임 오류 처리
  window.addEventListener('error', (event: ErrorEvent) => {
    // Vue에서 잡지 못한 일반적인 오류만 처리하도록 필터링할 수 있지만, 
    // 여기서는 확실하게 잡기 위해 기본적으로 모두 처리합니다.
    console.error('❌ [Window General Error]', event.error);
    
    const errorString = event.message;
    const errorStack = event.error instanceof Error ? event.error.stack : undefined;
    
    sendErrorToBackend({
      error: errorString,
      stack: errorStack,
      component: 'N/A',
      info: `script error at ${event.filename}:${event.lineno}`,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });
}

export function configError(app: App) {
  // 🌐 Global Error Handler 설정
  app.config.errorHandler = (err: unknown, instance: any, info: string) => {
    console.error('🌐 [Frontend Global Error]', err);
    console.error('Vue Component Instance:', instance, ' type: ', instance.type, ' vnode: ', instance.vnode);
    console.error('Error Info:', info);

    // 오류 정보를 백엔드로 전송하기 위한 데이터 구조화
    let errorString: string;
    let errorStack: string | undefined;

    if (err instanceof Error) {
      errorString = err.message;
      errorStack = err.stack;
    } else {
      // Error 객체가 아닌 경우 (e.g., throw "string")
      errorString = String(err);
    }

    // ➡️ 4번 단계의 함수 호출 (다음 단계에서 구현할 부분)
    sendErrorToBackend({
      error: errorString,
      stack: errorStack, // 스택 트레이스
      component: instance ? (instance.$.type.__file || 'N/A') : 'N/A', // 컴포넌트 파일명
      info: info, // Vue 특정 정보 (e.g., 'render function', 'mounted hook')
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  };

  addErrorEvent()
}
