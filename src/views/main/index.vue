<template>
  <div class="main-container">
    <!-- 제목 -->
    <h2>📸 이미지 파일 압축</h2>
    <div class="main-description">
      이미지 파일 업로드 시에 용량 문제를 해결하여 사용자 경험을 개선시키고 서버 용량 부담을 낮추는 것이 목표
    </div>
    <!-- 동기 -->
    <OrderContainer :title="motive.title" :items="motive.items" />
    <!-- 사용기술 -->
    <div>
      <img src="https://img.shields.io/badge/Vue-3.5.18-%234FC08D?logo=vuedotjs" alt="vue" />
      <img src="https://img.shields.io/badge/Quasar-2.17.0-blue?logo=quasar" alt="quasar" />
      <img src="https://img.shields.io/badge/Compressorjs-1.2.1-orange" alt="compressorjs" />
    </div>
    <!-- asis / tobe 비교 -->
    <CardContainer 
      :title="asistobe.title"
      :items="asistobe.items"
    />
    <!-- 결과 비교 -->
    <CardContainer 
      :title="resultCompare.title"
      :items="resultCompare.items"
    />
    <CardContainer 
      :title="improve.title"
      :items="improve.items"
    />
    <!-- 총평 -->
    <!-- <UploadBefore :attachInfo="attachBefore" label="이전" /> -->
    <!-- <UploadAfter :attachInfo="attachAfter"  label="이후" /> -->
  </div>
</template>
<script setup lang="ts">

/******************************
 * #Important 사용하지 않는 로직, 변수 등 선언 X
 *******************************/

/******************************
 * @import_선언
 * TODO 아래 순서에 맞추어 import (각 순서 마다 띄우기)
 *  * 1. Dependency
 *  * 2. Utils
 *  * 3. Types
 *  * 4. Stores
 *  * 5. Vue
 *  * 6. Etc (생길 시 얘기.)
 *******************************/

/******************************
 * @컴포넌트_옵션_선언
 * TODO 이름 정의 (파일 이름 그대로 지정)
 *******************************/
defineOptions({
  name: 'mainIndex'
})

/******************************
 * @Pinia_store_선언
 * TODO 반응형 유지를 위해 storeToRefs 사용 (function은 사용 X)
 *******************************/
/******************************
 * @Emit_선언
 *******************************/

/******************************
 * @Vue_관련_선언 (ex. vue-router)
 *******************************/

/******************************
 * @Interface_선언
 *******************************/

/******************************
 * @inject_선언
 *******************************/

/******************************
 * @Props_선언
 * TODO type & default 작성
 *******************************/

/******************************
 * @VModel_선언
 *******************************/

/******************************
 * @Data_선언
 * TODO ref, reactive 사용, 불명확한 단어 사용 X (ex. data, date)
 *******************************/
const motive = ref({
  title: '🔥 이와 같은 작업을 하게된 동기!!',
  items: [
    '웹앱을 통해 사진을 현잔에서 찍고 하는 일들이 많이 발생함',
    '요즘 스마트폰의 화질이 좋아짐에 따라 사진 용량이 큼',
    '1. 하루에 수백장이 쌓이다보니 서버 용량 부담이 발생<br/>2. 찍힌 사진을 웹에서 보여주려할때 load되는 시간이 길어지게 됨',
    '사진을 압축시켜 용량을 떨어트림',
    '사진이 고화질일 필요가 없음 (따라서 고화질 사진을 따로 저장하거나 하지 않음)',
    '1. 서버 용량에 대한 부담감이 낮아짐 <br/>2. 네트워크 응답이 빨라지게 됨',
  ]
})
const asistobe = ref({
  title: '🔍 이미지 압축 업로드 순서 비교',
  items: [
    { 
      headerContents: '사용자가 파일을 첨부', 
      haveContents: false,
    },
    { 
      headerContents: 'reject file 체크', 
      haveContents: true,
      asisContents: [
        { 
          laguageType: 'javascript',
          description: '업로드 준비 중인 파일이 거부되는 조건에 부합되는 경우 rejected method에 걸려 원인을 알림창으로 noti 해요.',
          contents: `/******************************
 * TODO (목적): 업로드할 파일 거부
 * @param (1): 거부된 정보
 *******************************/
function rejected(info: any) {
  if (!info || info.length === 0) {
    return
  }
  let message = ''
  _.forEach(info, (reject) => {
    // accept, max-file-size, max-total-size, filter, etc
    switch (reject.failedPropValidation) {
      case 'max-file-size': // 파일용량 초과
      case 'max-total-size': // 파일 전체 용량 초과
        message +=
          $language('첨부하신 파일의 용량이 지정된 용량보다 큽니다. 파일 용량 : ') +
          '(' +
          getFileSizeTextByRound(reject.file.size) +
          ')'
        break
      case 'max-files': // 업로드 갯수 초과
        message =
          $language('첨부하신 파일의 지정된 업로드 갯수를 초과하여 업로드 되지 않았습니다.') +
          '(' +
          uploaderSetting.value.limitCnt +
          ')'
        break
      case 'accept': // 확장자 맞지않음
        message =
          $language('첨부하신 파일의 확장자가 올바르지 않습니다.') +
          '(' +
          uploaderSetting.value.acceptExt +
          ')'
        break
      case 'filter': // filter 걸린경우
        // 해당 기능 사용하지 않음으로 다국어 처리하지 않음
        message =
          '첨부하신 이미지 "' +
          reject.file.name +
          '"의 사이즈가 올바르지 않습니다. (사이즈 : ' +
          props.imageRestriction.width +
          ' X ' +
          props.imageRestriction.height +
          ')'
        break
      default:
        break
    }
  })
  $q.notify({
    color: 'negative',
    html: true,
    message: message,
    multiLine: true,
    timeout: 5000
  })
}`
        }
      ],
      tobeContents: [],
      isSame: true
    },
    { 
      headerContents: '추가된 파일 업로드', 
      haveContents: true,
      // 'auto-upload, url, header, method, form-fields를 통해 자동 업로드 됨으로 표시',
      asisContents: [
        { 
          laguageType: 'html', 
          description: 'Quasar에서 제공하는 uploader 컴포넌트를 이용했어요.<br/>파일을 추가하면 API server에 바로 요청을 보낼 수 있도록 속성을 정의했어요.',
          contents: `<q-uploader
  with-credentials
  ref="customUpload"
  field-name="file"
  :url="url"
  :headers="headers"
  method="POST"
  :form-fields="formFields"
  :auto-upload="true"
  @finish="finish"
  @failed="failed"
  @rejected="rejected"
/>` 
        },
        { 
          laguageType: 'javascript', 
          description: 'API server에 바로 요청을 보낼 수 있도록 정의한 속성은 다음과 같아요.',
          contents: `const url = computed(
  () => import.meta.env.VITE_API_URL + transactionConfig.com.upload.uploading.url
)
const headers = computed(() => [{ name: 'Authorization', value: accessToken.value }, { name: 'withCredentials', value: 'true' }])
const formFields = computed(() => {
  const data = [
    {
      name: 'regId',
      value: user.value.userId
    },
    {
      name: 'modId',
      value: user.value.userId
    }
  ]
  if (props.attachInfo) {
    if (props.attachInfo.taskClassCd) {
      data.push({
        name: 'taskClassCd',
        value: props.attachInfo.taskClassCd
      })
    }
    /**
     * 신규인 경우 taskKey가 없을 수 있음
     * 해당의 경우 api-server에서 유니크한 id를 생성하여 저장 후 반환한다.
     */
    if (props.attachInfo.taskKey) {
      data.push({
        name: 'taskKey',
        value: props.attachInfo.taskKey
      })
    } else {
      const val = props.attachInfo.taskClassCd + '_' + uid()
      data.push({
        name: 'taskKey',
        value: val
      })
    }
  }
  return data
})` 
        },
      ],
      // 'added method 추가, 압축 진행하는 method들 보여주기',
      tobeContents: [
        {
          laguageType: 'html', 
          description: 'API server에 바로 요청 보내기전에 압축을 진행할 거예요.<br/>그래서 🔁변경되고, ➕추가된 속성이 있어요.',
          contents: `<q-uploader
  with-credentials
  ref="customUpload"
  field-name="file"
  :url="url"
  :headers="headers"
  method="POST"
  :form-fields="formFields"
  :auto-upload="false" 🔁변경
  @added="added" ➕추가
  @finish="finish"
  @failed="failed"
  @rejected="rejected"
/>`
        },
        {
          laguageType: 'javascript', 
          description: '파일 압축을 위한 상태를 정의해요.',
          contents: `/** 파일 압축 */
const queueFileInfo = ref<queueFileInfoType>({
  files: [],
  compressFiles: [],
  len: 0,
  isStart: false,
  isUpload: false
})
/** compressor Data */
const options = ref<Compressor.Options>({
  strict: true,
  checkOrientation: true,
  maxWidth: 600,
  maxHeight: undefined,
  minWidth: 0,
  minHeight: 0,
  width: undefined,
  height: undefined,
  resize: 'contain', // none contain cover
  quality: 0.1,
  mimeType: '',
  convertTypes: 'image/png',
  convertSize: 5000000,
  success: () => {},
  error: () => {}
})
/******************************
 * TODO (목적): 파일 압축 옵션 셋팅
 *******************************/
function setCompressOptions() {
  options.value.success = successCompress
  options.value.error = errorCompress
}
/******************************
 * TODO (목적): 파일 압축 성공
 * @param (1): 압축 성공한 파일 정보
 *******************************/
function successCompress(result: any) {
  if (!queueFileInfo.value.compressFiles) queueFileInfo.value.compressFiles = []
  queueFileInfo.value.compressFiles.push(result)
  queueLenMi()
}
/******************************
 * TODO (목적): 파일 압축 실패
 * @param (1): 실패 정보
 *******************************/
function errorCompress(err: any) {
  console.log(err)
}`
        },
        {
          laguageType: 'javascript', 
          description: '업로드할 파일이 추가되면 추가된 파일들을 압축을 시켜요.<br/>압축이 끝나면 API server로 q-uploader에 압축된 파일을 추가해 upload 요청을 보내게 해요.',
          contents: `/******************************
 * TODO (목적): 파일 추가, 추가하는 동시에 파일 압축진행
 * @param (1): 추가한 파일들
 *******************************/
function added(files: readonly any[]) {
  if (queueFileInfo.value.isUpload) return
  compressCheck(files, uploaderSetting.value)
}
/******************************
 * TODO (목적): 파일 압축 체크
 * @param (1): 압축할 파일들
 * @param (2): 압축 셋팅정보
 *******************************/
function compressCheck(files: readonly any[], uploadSetting: any) {
  if (files && files.length > 0) {
    _.extend(queueFileInfo.value.files, files)
    queueFileInfo.value.compressFiles = []
    queueFileInfo.value.isStart = true
    if (uploadSetting) {
      if (uploadSetting.resizeWidth === 0) {
        options.value.maxWidth = undefined
        options.value.quality = 1
      } else {
        options.value.maxWidth = uploadSetting.resizeWidth
        options.value.quality = uploadSetting.resizeQuality
      }
    }
    // 이미지 파일을 포함한 모든 파일의 갯수
    queueFileInfo.value.len = files.length
    _.forEach(queueFileInfo.value.files, (_file) => {
      compress(_file)
    })
  }
}
/******************************
 * TODO (목적): 파일 압축
 * @param (1): 압축할 파일
 *******************************/
function compress(file: any) {
  if (!file) {
    return
  }
  const reg = /(gif|jpe?g|tiff?|png|webp|bmp)$/g
  const _check = reg.test(file.type)
  if (_check) {
    new Compressor(file, options.value)
    // 이미지
  } else {
    if (!queueFileInfo.value.compressFiles) queueFileInfo.value.compressFiles = []
    queueFileInfo.value.compressFiles.push(file)
    queueLenMi()
  }
}
/******************************
 * TODO (목적): 압축된 파일 API 서버에 저장 요
 *******************************/
function queueLenMi() {
  queueFileInfo.value.len = queueFileInfo.value.len - 1

  if (queueFileInfo.value.isStart && queueFileInfo.value.len === 0) {
    customUpload.value.removequeueFiles()
    queueFileInfo.value.isUpload = true
    setTimeout(() => {
      customUpload.value.addFiles(queueFileInfo.value.compressFiles)

      customUpload.value.upload()
    }, 500)
  }
}`
        },
      ]
    },
    { 
      headerContents: 'API server 저장 실패한 경우', 
      haveContents: true,
      asisContents: [
        { 
          laguageType: 'javascript', 
          description: '업로드가 실패하게 되면 실패한 파일정보를 알림창을 통해 noti해요.',
          contents: `/******************************
 * TODO (목적): 파일 업로드 실패
 * @param (1): 실패 정보
 *******************************/
function failed(info: any) {
  let message = ''
  if (info && info.files && info.files.length > 0) {
    message = '['
    let idx = 0
    _.forEach(info.files, (file) => {
      message += '"' + file.name + (idx !== info.files.length - 1 ? '", ' : '"] ')
      idx++
    })
    message += $language('업로드에 실패하였습니다.')
  }
  $q.notify({
    color: 'negative',
    html: true,
    message: message,
    multiLine: true,
    timeout: 5000
  })
}`
        }
      ],
      tobeContents: [],
      isSame: true
    },
    { 
      headerContents: '업로드 종료', 
      haveContents: true,
      asisContents: [
        {
          laguageType: 'javascript', 
          description: '업로드가 끝나게되면(실패/성공) 업로드 된 파일을 비워주고 리셋해요.<br/>그러고 난 다음 저장된 파일 정보를 조회해서 사용자가 파일들을 볼 수 있게 해요.',
          contents: `/******************************
 * TODO (목적): 파일 업로드 종료
 *******************************/
function finish() {
  customUpload.value.removeUploadedFiles()
  customUpload.value.reset()
  getUploadedFiles() // 저장된 파일정보 조회
}`
        }
      ],
      tobeContents: [
        {
          laguageType: 'javascript', 
          description: '업로드 된 파일을 비워주고 리셋하는 과정에서 압축을 위해 관리한 상태들도 리셋하는 method call을 추가해줘요.',
          contents: `/******************************
 * TODO (목적): 파일 업로드 종료
 *******************************/
function finish() {
  customUpload.value.removeUploadedFiles()
  customUpload.value.reset()
  reset() // ➕ 추가
  getUploadedFiles() // 저장된 파일정보 조회
}
/******************************
 * TODO (목적): 압축파일 리스트 목록 초기화
 *******************************/
function reset() {
  queueFileInfo.value.files = []
  queueFileInfo.value.compressFiles = []
  queueFileInfo.value.len = 0
  queueFileInfo.value.isStart = false
  queueFileInfo.value.isUpload = false
}`
        }
      ],
    }
  ]
})
const resultCompare = ref({
  title: '👀 이미지 압축 결과 비교',
  items: [
    { 
      headerContents: '업로드 된 사진파일 데이터 비교', 
      haveContents: true,
      isAggregated: true,
      aggregateContents: [
        { 
          laguageType: 'image',
          description: 'BEFORE와 AFTER 데이터(task_class_cd)를 보게 되면 압축 전 후에 대한 저장된 정보를 볼 수 있어요.<br/>사이즈를 보게 되면 463배 정도 용량이 작아진 걸 확인할 수 있어요.',
          contents: new URL('@/assets/images/compare/데이터 비교.png', import.meta.url).href
        },
        { 
          laguageType: 'image',
          contents: new URL('@/assets/images/compare/afterbefore_속성창.png', import.meta.url).href
        }
      ],
    },
    { 
      headerContents: '사진 화질 비교', 
      haveContents: true,
      isAggregated: true,
      aggregateContents: [
        { 
          laguageType: 'image',
          description: '고화질이 아니여도 된다고 했지만 식별이 가능해야 해요. 압축 전(왼쪽) / 후(오른쪽) 사진을 보면서 화질이 낮아졌지만 고객이 인식/수긍 할 수 있는 범위까지 떨어트려 효율을 챙겼어요.',
          contents: new URL('@/assets/images/compare/화질 비교 사진.png', import.meta.url).href
        },
      ],
    },
    { 
      headerContents: 'Axios 요청/응답 시간 비교', 
      haveContents: true,
      isAggregated: true,
      aggregateContents: [
        { 
          laguageType: 'image',
          description: 'Request sent시간을 보게 되면 189.20ms ➡️ 0.49ms로 386배나 차이나고 있는걸 볼 수 있어요.<br/>API server에서도 파일을 물리적으로 저장하기 위해 시간이 소비될 겁니다.<br/>Waiting for server reponse를 보게 되면 329.74ms ➡️ 122.26ms로 2.6배 차이가 나는걸 확인 할 수 있어요.',
          contents: new URL('@/assets/images/compare/axios 요청 응답 시간 비교.png', import.meta.url).href
        },
      ],
    },
  ]
})
const improve = ref({
  title: '🤔 다른 방안은 없을까?',
  items: [
    { 
      headerContents: '고화질을 원한다면 이미지 포맷 최적화를 고려해 볼 수 있어요.', 
      haveContents: true,
      isAggregated: true,
      aggregateContents: [
        { 
          laguageType: 'html',
          description: 'WebP 또는 AVIF 포맷으로 변환해서 이미지 품질은 유지하면서 파일 용량을 줄일 수 있어요.<br/>다만 원본 이미지가 올라가야 함으로 이미지 업로드 할때 부하가 걸릴 수 있으며, 서버용량이 더 빨리 차는 단점이 있어요.<br/>html 단에서 다음과 같이 작성해서 브라우저에서 제공이 안되는 케이스를 예방해요.',
          contents: `<picture>
  <!-- AVIF -->
  <source :srcset="item.contents + '.avif'" type="image/avif">
  <!-- WebP -->
  <source :srcset="item.contents + '.webp'" type="image/webp">
  <!-- JPG fallback -->
  <img :src="item.contents + '.jpg'" alt="데이터 비교" style="width: 100%; height: auto;">
</picture>`,
        },
        { 
          laguageType: 'javascript',
          description: 'Java단에서 파일이 업로드 되는 시점에 비동기로 webp, avif 포맷으로 변환을 시켜줘요.<br/>저 같은 경우 windows os(local)에 webp, avif 실행파일을 설치해서 구동했어요.',
          contents: `    private void convertToOptimizedFormatsAsync(Path originalPath) {
        executor.submit(() -> {
            try {
                runCwebp(originalPath, getSiblingPath(originalPath, "webp"), 75);
                runAvifenc(originalPath, getSiblingPath(originalPath, "avif"));
            } catch (Exception e) {
                e.printStackTrace();
                // TODO: DB status 업데이트 (FAILED)
            }
        });
    }

    private Path getSiblingPath(Path original, String newExt) {
        String fileName = original.getFileName().toString();
        int dot = fileName.lastIndexOf('.');
        String base = (dot == -1) ? fileName : fileName.substring(0, dot);
        return original.getParent().resolve(base + "." + newExt);
    }

    private void runCwebp(Path input, Path output, int quality) throws IOException, InterruptedException {
        List<String> cmd = List.of(
        		"cwebp", 
        		"-q", String.valueOf(quality), 
        		input.toString(), 
        		"-o", output.toString());
        runProcess(cmd);
    }

    private void runAvifenc(Path input, Path output) throws IOException, InterruptedException {
        List<String> cmd = List.of(
        		"avifenc", 
        		input.toString(), 
        		output.toString());
        runProcess(cmd);
    }

    private void runProcess(List<String> cmd) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process proc = pb.start();

        try (InputStream is = proc.getInputStream()) {
            String output = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            int exit = proc.waitFor();
            if (exit != 0) {
                throw new RuntimeException("Command failed: " + String.join(" ", cmd) + "\n" + output);
            }
        }
    }`,
        },
        { 
          laguageType: 'image',
          description: '변환한 실제 이미지를 불러온거예요. 다만 브라우저 지원이 안된다면 원본 파일이 표시될 거예요.',
          contents: 'http://localhost:8080/images/BEFORE/20250902/49664d4d-30c7-448b-8042-789f414042e5',
          isUrl: true
        },
      ],
    },
    { 
      headerContents: '지연로딩을 고려해 볼 수 있어요.', 
      haveContents: true,
      isAggregated: true,
      aggregateContents: [
        { 
          laguageType: 'components',
          description: '브라우저가 한번에 load 하는 부담도 줄이면서 사용자도 좋은 경험을 가질 수 있어요.',
          contents: shallowRef(defineAsyncComponent(() => import(`@/components/ImageContainer.vue`)))
        },
      ],
    },
  ]
})
// const attachBefore = ref<attachSettingType>({
//   isSubmit: '',
//   taskClassCd: 'BEFORE',
//   taskKey: '1'
// })
// const attachAfter = ref<attachSettingType>({
//   isSubmit: '',
//   taskClassCd: 'AFTER',
//   taskKey: '2'
// })

/******************************
 * @Computed_선언
 *******************************/

/******************************
 * @Watch_선언
 *******************************/

/******************************
 * @Life_cycle_선언
 *******************************/

/******************************
 * @Function_선언
 * TODO function 주석 작성 (asdffunctionannotation 사용)
 *  * arrow function 사용해도 무관
 *******************************/

/******************************
 * @Provide_선언
 *  ! types 폴더에 type 명시
 *******************************/
</script>