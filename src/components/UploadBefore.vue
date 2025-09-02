<template>
  <div
    v-if="isUploaderSetting"
    :class="[fullWidth ? 'row autoHeight' : 'fix-height row upload-cover']"
  >
    <div
      v-show="editable"
      :class="[fullWidth ? 'col-12 fullWidth' : 'col-xs-12 col-sm-12 col-md-4 col-lg-4']"
    >
      <q-uploader
        flat
        bordered
        with-credentials
        ref="customUpload"
        color="custom-upload-color"
        class="custom-upload"
        field-name="file"
        :url="url"
        :headers="headers"
        method="POST"
        :label="$language(label)"
        :form-fields="formFields"
        :auto-upload="true"
        :hide-upload-btn="true"
        :multiple="uploaderSetting.multipleSelFlag === 'Y'"
        :accept="uploaderSetting.acceptExt"
        :max-file-size="uploaderSetting.limitSize * 1000000"
        :max-total-size="uploaderSetting.limitSize * 1000000 * uploaderSetting.limitCnt"
        :max-files="maxFiles"
        :no-thumbnails="uploaderSetting.previewFlag === 'Y'"
        :disable="!editable"
        :style="[fullWidth ? '' : maxheight]"
        @finish="finish"
        @failed="failed"
        @rejected="rejected"
      >
        <!-- :filter="filter" -->
        <template v-slot:header="scope">
          <div class="row no-wrap items-center">
            <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
            <div class="col" style="padding-top: 0px !important; margin-top: 0px !important">
              <div
                class="q-uploader__title inline-block"
                :style="{
                  padding: '4px 0px !important',
                  fontSize: '0.95em !important',
                  marginLeft: fullWidth ? '10px !important' : '0'
                }"
              >
                {{ $language(label) }}
              </div>
              &nbsp;&nbsp;
              <div class="q-uploader__subtitle inline-block" v-if="editable">
                {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
              </div>
            </div>
            <q-btn
              v-if="haveImage()"
              icon="visibility"
              dense
              flat
              size="sm"
              @click="allImagePreView"
            >
              <!-- 이미지 파일 미리보기 -->
              <q-tooltip>{{ $language('이미지 파일 미리보기') }}</q-tooltip>
            </q-btn>
            <q-btn
              v-if="fileList && fileList.length > 0"
              icon="delete_outline"
              dense
              flat
              size="sm"
              @click="removeAllFiles"
            >
              <q-tooltip>{{ $language('파일 전체 삭제') }}</q-tooltip>
            </q-btn>
          </div>
        </template>
        <template v-slot:list="scope">
          <template v-if="scope.files && scope.files.length > 0">
            <q-list separator>
              <q-item v-for="file in scope.files" :key="file.name">
                <q-item-section>
                  <q-item-label class="full-width ellipsis">
                    {{ file.name }}
                  </q-item-label>

                  <q-item-label caption> Status: {{ file.__status }} </q-item-label>

                  <q-item-label caption>
                    {{ file.__sizeLabel }} / {{ file.__progressLabel }}
                  </q-item-label>
                </q-item-section>

                <q-item-section v-if="file.__img" thumbnail class="gt-xs">
                  <img :src="file.__img.src" />
                </q-item-section>

                <q-item-section top side>
                  <q-btn
                    class="gt-xs"
                    size="12px"
                    flat
                    dense
                    round
                    icon="delete"
                    @click="scope.removeFile(file)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </template>
          <template v-else>
            <div class="empty_dscription">
              <div style="text-align: center; padding-bottom: 5px" v-show="editable">
                <q-chip outline square icon="info" style="width: 100%"> Drag or Click </q-chip>
              </div>
              <div class="q-pl-md txtfileinfo" style="text-align: left">
                <span class="text-positive">{{ $language('업로드 가능 확장자') }}</span>
                : {{ uploaderSetting.acceptExt }}
                <br />
                <span class="text-positive">{{ $language('업로드 가능 파일 수') }}</span>
                : {{ uploaderSetting.limitCnt }}
                <br />
                <span class="text-positive">{{ $language('허용 파일 크기') }}</span>
                : {{ uploaderSetting.limitSize }}MB
              </div>
              <q-uploader-add-trigger />
            </div>
          </template>
        </template>
      </q-uploader>
    </div>
    <div :class="fileListClass">
      <q-list separator bordered class="uploaded-file-list" v-if="!isPhoto">
        <template v-if="fileList && fileList.length > 0">
          <q-item class="fileuploadItem">
            <span style="font-size: 12px; font-weight: 600">[{{ $language(label) }}]</span>
          </q-item>
          <q-item v-for="(file, idx) in fileList" :key="idx" class="fileuploadItem">
            <q-item-section class="fileuploadColumn">
              <q-item-label class="full-width file-origin-name">
                <span
                  class="text-blue cursor-pointer"
                  @click.prevent="fileDown(file)"
                  style="font-size: 0.95em !important"
                >
                  {{ file.oriFileNm }}
                </span>
                <span class="text-caption"> ({{ getFileSizeTextByRound(file.fileSize) }}) </span>
              </q-item-label>
              <q-item-label v-if="uploaderSetting.explainFlag === 'Y'">
                <q-input
                  :disable="!editable"
                  class="file-description"
                  name="description"
                  :placeholder="$language('파일설명')"
                  v-model="file.description"
                  @blur="() => descriptionSave(file)"
                />
              </q-item-label>
            </q-item-section>

            <q-item-section
              v-if="file.contentType && file.contentType.indexOf('image') > -1"
              thumbnail
              class="gt-xs cursor-pointer"
            >
              <img
                class="thumnailUpload"
                :src="file.imgUrl ? file.imgUrl : file.filePath"
                @click.prevent="setPreview(file, 'single')"
              />
            </q-item-section>

            <q-item-section side>
              <div>
                <q-btn
                  v-if="editable"
                  class="gt-xs"
                  size="11px"
                  flat
                  dense
                  round
                  icon="delete"
                  @click.prevent="removeFile(file)"
                >
                  <q-tooltip>{{ $language('파일 삭제') }}</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item class="fileuploadItem nofileArea" :style="{ display: 'block' }">
            <template>
              <span style="font-size: 12px; font-weight: 600">[{{ $language(label) }}]</span>
            </template>
            <div>
              {{ $language('업로드된 파일이 없습니다.') }}
            </div>
          </q-item>
        </template>
      </q-list>
      <q-list separator bordered class="uploaded-file-list row" v-else>
        <template v-if="fileList && fileList.length > 0">
          <div class="upload-title-font col-12">[{{ $language(label) }}]</div>
          <q-item v-for="(file, idx) in fileList" :key="idx" class="col-3 text-center">
            <q-item-section>
              <q-item-label class="upload-photo-layer">
                <img
                  class="thumnailUploadPhoto"
                  :src="file.imgUrl ? file.imgUrl : file.filePath"
                  @click.prevent="setPreview(file, 'single')"
                />
                <q-btn
                  v-if="editable"
                  class="gt-xs"
                  size="10px"
                  flat
                  dense
                  round
                  icon="delete"
                  @click.prevent="removeFile(file)"
                >
                  <q-tooltip>{{ $language('파일 삭제') }}</q-tooltip>
                </q-btn>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item class="fileuploadItem nofileArea" :style="{ display: 'block' }">
            <template>
              <span style="font-size: 12px; font-weight: 600">[{{ $language(label) }}]</span>
            </template>
            <div>
              {{ $language('업로드된 파일이 없습니다.') }}
            </div>
          </q-item>
        </template>
      </q-list>
    </div>
    <div
      v-if="attachInfo.isRev"
      :class="[fullWidth ? 'col-12' : 'col-xs-12 col-sm-12 col-md-4 col-lg-4']"
    >
      <q-toolbar class="bg-primary text-white before-file-list-toolbar">
        <q-toolbar-title>{{ $language('이전 버전 파일 리스트') }}</q-toolbar-title>
      </q-toolbar>
      <q-list separator bordered class="uploaded-file-list_rev">
        <template v-if="beforeFileList && beforeFileList.length > 0">
          <q-item v-for="(file, idx) in beforeFileList" :key="idx" class="fileuploadItem">
            <q-item-section class="fileuploadColumn">
              <q-item-label class="full-width file-origin-name">
                <span
                  class="text-blue cursor-pointer"
                  @click.prevent="fileDown(file)"
                  style="font-size: 0.95em !important"
                >
                  {{ file.oriFileNm }}
                </span>
                <span class="text-caption"> ({{ getFileSizeTextByRound(file.fileSize) }}) </span>
              </q-item-label>
              <q-item-label v-if="uploaderSetting.explainFlag === 'Y'">
                <q-input
                  disable
                  class="file-description"
                  name="description"
                  v-model="file.description"
                />
              </q-item-label>
            </q-item-section>

            <q-item-section
              v-if="file.contentType && file.contentType.indexOf('image') > -1"
              thumbnail
              class="gt-xs cursor-pointer"
            >
              <img
                class="thumnailUpload"
                :src="file.imgUrl ? file.imgUrl : file.filePath"
                @click.prevent="setPreview(file, 'single')"
              />
            </q-item-section>

            <q-item-section side>
              <div>
                <q-btn
                  v-if="editable"
                  class="gt-xs"
                  size="11px"
                  flat
                  dense
                  round
                  :label="$language('복사')"
                  @click.prevent="copyFile(file)"
                />
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </div>
    <div
      v-if="
        isPhotoView &&
        previewfix &&
        (previewfix.src || (previewfix.fileList && previewfix.fileList.length > 0))
      "
      class="col-xs-12 col-sm-12 col-md-12 col-lg-12"
    >
      <div class="row">
        <div
          v-for="(file, idx) in previewfix.fileList"
          :key="idx"
          class="col-xs-12 col-sm-12 col-md-3 col-lg-3 fixPreview"
        >
          <div class="fixPreviewB">
            {{ file.description }}
          </div>
          <div class="fixPreviewH">
            <q-img :src="file.src" class="fixPreviewImg" />
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 미리보기 -->
    <q-dialog
      v-if="preview && (preview.src || (preview.fileList && preview.fileList.length > 0))"
      v-model="preview.isShow"
    >
      <q-card class="preview-image-card">
        <q-btn
          color="white"
          text-color="primary"
          @click="preview.isShow = false"
          round
          dense
          icon="close"
          class="preview-close-btn"
        >
          <q-tooltip class="bg-white text-primary">{{ $language('창닫기') }}</q-tooltip>
        </q-btn>
        <q-carousel
          v-if="preview.fileList && preview.fileList.length > 0"
          swipeable
          animated
          thumbnails
          infinite
          v-model="preview.slide"
          @transition="transitionImage"
        >
          <q-carousel-slide
            v-for="(file, idx) in preview.fileList"
            :key="idx"
            :name="file.attachFileId"
            :img-src="file.src"
          />
        </q-carousel>
        <q-img v-else :src="preview.src" />
        <q-card-section>
          <q-btn
            fab
            color="primary"
            icon="save_alt"
            class="absolute"
            style="top: 0; right: 12px; transform: translateY(-50%)"
            @click.prevent="fileDown(preview)"
          />
          <div class="row no-wrap items-center">
            <div class="col text-h6">
              {{ preview.oriFileNm }}
            </div>
            <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
              {{ getFileSizeTextByRound(preview.fileSize) }}
            </div>
          </div>
        </q-card-section>
        <q-separator v-if="preview.description" />
        <q-card-section v-if="preview.description" class="q-pt-none">
          <div class="text-subtitle1">
            <q-icon name="info" />
            {{ $language('파일 설명') }}
          </div>
          <div class="text-caption text-grey">
            {{ preview.description }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
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
import { encrypt, fileDownDecrypt } from '@utils/aes256'

import { useUserStore } from '@stores/user'

import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const { accessToken } = storeToRefs(auth)

/******************************
 * @컴포넌트_옵션_선언
 * TODO 이름 정의 (파일 이름 그대로 지정)
 *******************************/
defineOptions({
  name: 'UploadAfter'
})

/******************************
 * @Pinia_store_선언
 * TODO 반응형 유지를 위해 storeToRefs 사용 (function은 사용 X)
 *******************************/
/** userStore 호출 */
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
/** loading 호출 */
const loading = useLoadingStore()

/******************************
 * @Emit_선언
 *******************************/
const emits = defineEmits(['files', 'before-files'])

/******************************
 * @Vue_관련_선언 (ex. vue-router)
 *******************************/

/******************************
 * @Interface_선언
 *******************************/
interface propType {
  name?: string
  editable?: boolean
  label?: string
  isPhoto?: boolean
  isPhotoView?: boolean
  fullWidth?: boolean
  maxheight?: string
  attachInfo: attachSettingType
  imageRestriction?: {
    width: number
    height: number
  }
}
type previewType = {
  slide: number
  isShow: boolean
  attachFileId: string
  src: string
  oriFileNm: string
  fileSize: 0
  description: string
  fileExt: string
  fileList: Array<any>
}
type fileType = {
  oriFileNm: string
  fileSize: number
  description: string
  contentType: string
  imgUrl: string
  filePath: string
}

/******************************
 * @inject_선언
 *******************************/
const $language = inject('$language') as GetTranLanguageFunction

/******************************
 * @Props_선언
 * TODO type & default 작성
 *******************************/
const props = withDefaults(defineProps<propType>(), {
  name: '',
  editable: true,
  label: '첨부파일',
  isPhoto: false,
  isPhotoView: false,
  fullWidth: false,
  maxheight: '',
  attachInfo: () => {
    return {
      isSubmit: '',
      taskClassCd: '',
      taskKey: '',
      beforeTaskKey: '',
      isRev: false
    }
  },
  imageRestriction: () => {
    return {
      width: 0,
      height: 0
    }
  }
})

/******************************
 * @VModel_선언
 *******************************/

/******************************
 * @Data_선언
 * TODO ref, reactive 사용, 불명확한 단어 사용 X (ex. data, date)
 *******************************/
const preview = ref<previewType>({
  slide: 1,
  isShow: false,
  attachFileId: '',
  src: '',
  oriFileNm: '',
  fileSize: 0,
  description: '',
  fileExt: '',
  fileList: []
})
const previewfix = ref<previewType>({
  slide: 1,
  isShow: false,
  attachFileId: '',
  src: '',
  oriFileNm: '',
  fileSize: 0,
  description: '',
  fileExt: '',
  fileList: []
})
const isUploaderSetting = ref(false)
const uploaderSetting = ref({
  multipleSelFlag: 'N',
  previewFlag: 'N',
  acceptExt: '*',
  limitSize: 1048576,
  limitCnt: 5,
  noThumbnails: false,
  explainFlag: 'N',
  resizeWidth: 0,
  resizeQuality: 1
})
const fileList = ref<Array<fileType>>([])
const beforeFileList = ref<Array<fileType>>([])
const uploderSettingUrl = ref('')
const uploadedFilesUrl = ref('')
const updateUrl = ref('')
const tempTaskKeyUpdateUrl = ref('')
const allDeleteUrl = ref('')
const deleteUrl = ref('')
const previewUrl = ref('')
const fileDownUrl = ref('')
const fileCopyUrl = ref('')
const customUpload = ref<any>(null)
const fileSearchQueue = ref<Array<any>>([])
const $q = useQuasar()

/******************************
 * @Computed_선언
 *******************************/
const url = computed(
  () => import.meta.env.VITE_API_URL + transactionConfig.attach.file.upload.url
)
const headers = computed(() => [{ name: 'Authorization', value: accessToken.value }, { name: 'withCredentials', value: 'true' }])
const formFields = computed(() => {
  const data = [
    {
      name: 'regId',
      value: user.value.memberId
    },
    {
      name: 'modId',
      value: user.value.memberId
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
  console.log(data)
  return data
})
const maxFiles = computed(() => {
  const fileCnt = fileList.value ? fileList.value.length : 0
  console.log(uploaderSetting.value.limitCnt, ' ', fileCnt, '  ', fileList.value)
  return uploaderSetting.value.limitCnt - fileCnt
})
const fileListClass = computed(() => {
  let classText = 'col-xs-12 col-sm-12 col-md-12 col-lg-12'
  if (props.fullWidth) {
    classText = 'col-12'
  } else if (props.editable && !props.attachInfo.isRev) {
    classText = 'col-xs-12 col-sm-12 col-md-8 col-lg-8'
  } else if (props.editable && props.attachInfo.isRev) {
    classText = 'col-xs-12 col-sm-12 col-md-4 col-lg-4'
  }
  return classText
})

/******************************
 * @Watch_선언
 *******************************/
watch(
  () => props.attachInfo.taskClassCd,
  () => {
    setUploderSetting()
    getUploadedFiles()
  }
)
watch(
  () => props.attachInfo.taskKey,
  () => {
    getUploadedFiles()
  }
)
watch(
  () => props.attachInfo.beforeTaskKey,
  () => {
    getBeforeUploadedFiles()
  }
)
watch(
  () => props.attachInfo.isSubmit,
  () => {
    loading.loadingShow()
    if (fileList.value && fileList.value.length > 0) {
      _.forEach(fileList.value, (file: any) => {
        file.taskKey = props.attachInfo.taskKey
      })
    }
    // 첨부 저장하는 단계
    $http({
      url: tempTaskKeyUpdateUrl.value,
      method: 'PUT',
      data: fileList.value
    })
      .then((_result: any) => {
        if (_result.data) {
          // 신규로 등록됨에 따라 임시로 만든 taskKey를 반환처리
          getUploadedFiles()
          loading.loadingHide()
        }
      })
      .catch(() => {
        loading.loadingHide()
      })
  }
)
watch(
  fileSearchQueue.value,
  () => {
    if (fileSearchQueue.value && fileSearchQueue.value.length > 0) {
      const queue = fileSearchQueue.value[0]
      if (!queue.ing) {
        queue.ing = true
        queue.fnc(queue.taskClassCd, queue.taskKey).finally(() => {
          fileSearchQueue.value.shift()
        })
      }
    }
  },
  { deep: true }
)

/******************************
 * @Life_cycle_선언
 *******************************/
onBeforeMount(() => {
  init()
})

/******************************
 * @Function_선언
 * TODO function 주석 작성 (asdffunctionannotation 사용)
 *  * arrow function 사용해도 무관
 *******************************/
/******************************
 * TODO (목적): 초기셋팅
 *******************************/
function init() {
  // url setting
  uploderSettingUrl.value = selectConfig.attach.setting.get.url

  uploadedFilesUrl.value = selectConfig.attach.file.list.url
  previewUrl.value = selectConfig.attach.file.preview.url
  fileDownUrl.value = selectConfig.attach.file.down.url

  updateUrl.value = transactionConfig.attach.file.update.url
  tempTaskKeyUpdateUrl.value = transactionConfig.attach.file.save.url
  deleteUrl.value = transactionConfig.attach.file.delete.url
  allDeleteUrl.value = transactionConfig.attach.file.allDelete.url
  fileCopyUrl.value = transactionConfig.attach.file.copy.url


  setUploderSetting()
  getUploadedFiles()

  if (
    formFields.value &&
    formFields.value.length &&
    _.findIndex(formFields.value, { name: 'taskKey' }) > -1
  ) {
    const taskKeyData: any = _.find(formFields.value, { name: 'taskKey' })
    props.attachInfo.taskKey = taskKeyData.value
  }
}
/******************************
 * TODO (목적): byte단위의 파일 크기를 보기 좋게 표시
 * @param (1): 파일 크기 (byte)
 *******************************/
function getFileSizeTextByRound(_fileByteSize: number) {
  return bytesToSize(_fileByteSize)
}
/******************************
 * TODO (목적): 파일 업로드 종료
 *******************************/
function finish() {
  customUpload.value.removeUploadedFiles()
  customUpload.value.reset()
  getUploadedFiles()
}
/******************************
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
}
/******************************
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
}
/******************************
 * TODO (목적): 업무에 따른 첨부파일 속성 셋팅
 *******************************/
function setUploderSetting() {
  if (!props.attachInfo.taskClassCd) return
  $http({
    url: $format(uploderSettingUrl.value, props.attachInfo.taskClassCd),
    method: 'GET',
  }).then((_result: any) => {
    if (_result.data.data) {
      isUploaderSetting.value = true
      _.extend(uploaderSetting.value, _result.data.data)
    }
  })
}
/******************************
 * TODO (목적): 업무 & 문서에 따른 첨부파일 조회
 *******************************/
function getUploadedFiles() {
  if (!props.attachInfo.taskClassCd || !props.attachInfo.taskKey) {
    fileList.value = []
    return
  }
  fileSearchQueue.value.push({
    taskClassCd: _.clone(props.attachInfo.taskClassCd),
    taskKey: _.clone(props.attachInfo.taskKey),
    fnc: searchFile.bind(''),
    ing: false
  })
}
function searchFile(taskClassCd: string, taskKey: string) {
  return new Promise((_resolve, _reject) => {
    $http({
      url: uploadedFilesUrl.value,
      method: 'GET',
      params: {
        taskClassCd: taskClassCd,
        taskKey: taskKey
      }
    })
      .then((_result: any) => {
        fileList.value = []
        if (_result.data) {
          // 신규로 등록됨에 따라 임시로 만든 taskKey를 반환처리
          fileList.value = _result.data.data
          if (fileList.value && fileList.value.length > 0) {
            _.forEach(fileList.value, (item: any) => {
              const encstr = item.previewImage
              const url = window.URL || window.webkitURL
              const blob = base64ToBlob(encstr, 'image/jpeg')
              const imgUrl = url.createObjectURL(blob)
              item.imgUrl = imgUrl
            })
          }
        }
        emits('files', fileList.value)
        if (props.isPhotoView) {
          allImagePreViewFix()
        }
        _resolve(true)
      })
      .catch(() => {
        _resolve(true)
      })
  })
}
/******************************
 * TODO (목적): 이전 버전의 첨부파일 조회
 *******************************/
function getBeforeUploadedFiles() {
  if (props.attachInfo.taskClassCd && props.attachInfo.beforeTaskKey) {
    $http({
      url: uploadedFilesUrl.value,
      method: 'GET',
      params: {
        taskClassCd: props.attachInfo.taskClassCd,
        taskKey: props.attachInfo.beforeTaskKey
      }
    }).then((_result: any) => {
      beforeFileList.value = []
      if (_result.data.data) {
        // 신규로 등록됨에 따라 임시로 만든 taskKey를 반환처리
        beforeFileList.value = _result.data.data
        if (beforeFileList.value && beforeFileList.value.length > 0) {
          _.forEach(beforeFileList.value, (item: any) => {
            const encstr = item.previewImage
            const url = window.URL || window.webkitURL
            const blob = base64ToBlob(encstr, 'image/jpeg')
            const imgUrl = url.createObjectURL(blob)
            item.imgUrl = imgUrl
          })
        }
      }
      emits('before-files', beforeFileList.value)
    })
  } else {
    beforeFileList.value = []
  }
}
/******************************
 * TODO (목적): 파일 다운로드
 * @param (1): 다운로드할 파일 정보
 *******************************/
function fileDown(file: any) {
  const accept = getAccept(file.fileExt)
  $http({
    url: fileDownUrl.value,
    method: 'GET',
    params: {
      attachFileId: encrypt(file.attachFileId)
    }
  }).then((_result: any) => {
    const fileInfo = fileDownDecrypt(_result.data.data)
    if (fileInfo.id === file.attachFileId) {
      const blob = base64ToBlob(fileInfo.bytes, accept)
      const nav = window.navigator as any
      if (nav && nav.msSaveOrOpenBlob) {
        nav.msSaveOrOpenBlob(blob, file.oriFileNm)
      } else {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = file.oriFileNm
        link.click()
      }
    } else {
      message.alert({
        title: '안내', // 안내
        message: '잘못된 정보입니다.',
        type: 'error' // success / info / warning / error
      })
    }
  })
}
/******************************
 * TODO (목적): 이미지 파일 존재여부 파악
 * @return (반환): 이미지 파일 존재여부
 *******************************/
function haveImage() {
  if (fileList.value && fileList.value.length > 0) {
    let flag = false
    _.forEach(fileList.value, (file: any) => {
      if (file.contentType && file.contentType.indexOf('image') > -1) {
        flag = true
        return false
      }
    })
    return flag
  } else {
    return false
  }
}
/******************************
 * TODO (목적): 미리보기 셋팅
 * @param (1): 미리보기할 파일 정보
 * @param (2): 파일 여러 개 여부 flag
 *******************************/
function setPreview(file: any, type: 'single' | 'multi') {
  if (!file) return
  // 이미지인  경우
  if (file.attachFileId) {
    if (type === 'single') {
      preview.value.fileList = []
    }
    $http({
      url: previewUrl.value,
      method: 'GET',
      params: {
        attachFileId: encrypt(file.attachFileId)
      }
    }).then((_result: any) => {
      const fileInfo = fileDownDecrypt(_result.data.data)
      if (fileInfo.id === file.attachFileId) {
        preview.value.isShow = true
        preview.value.attachFileId = file.attachFileId
        if (type === 'single') {
          preview.value.src = 'data:' + file.contentType + ';base64,' + fileInfo.bytes
        } else {
          const curFile: any = _.find(preview.value.fileList, {
            attachFileId: file.attachFileId
          })
          curFile.src = 'data:' + file.contentType + ';base64,' + fileInfo.bytes
        }
        preview.value.oriFileNm = file.oriFileNm
        preview.value.fileSize = file.fileSize
        preview.value.description = file.description
        preview.value.fileExt = file.fileExt
      } else {
        message.alert({
          title: '안내',
          message: '잘못된 정보입니다.',
          type: 'error' // success / info / warning / error
        })
      }
    })
  }
}
/******************************
 * TODO (목적): 모든 이미지 미리보기
 *******************************/
function allImagePreView() {
  if (fileList.value && fileList.value.length > 0) {
    preview.value.fileList = []
    _.forEach(fileList.value, (file: any) => {
      if (file.contentType && file.contentType.indexOf('image') > -1) {
        file.src = file.imgUrl
        preview.value.fileList.push(file)
      }
    })
    const firstFile = preview.value.fileList[0]
    preview.value.slide = firstFile.attachFileId
    preview.value.isShow = true
    setPreview(firstFile, 'multi')
  } else {
    preview.value.fileList = []
  }
}
/******************************
 * TODO (목적):
 * @param (1):
 * @param (2):
 * @return (반환):
 *******************************/
function allImagePreViewFix() {
  previewfix.value.fileList = []
  if (fileList.value && fileList.value.length > 0) {
    _.forEach(fileList.value, (file: any) => {
      if (file.contentType && file.contentType.indexOf('image') > -1) {
        file.src = file.imgUrl
        previewfix.value.fileList.push(file)
      }
    })
    const firstFile: any = fileList.value[0]
    previewfix.value.slide = firstFile.attachFileId
    previewfix.value.isShow = true
    setPreviewFix(firstFile, 'multi')
  } else {
    previewfix.value.fileList = []
  }
}
/******************************
 * TODO (목적): 미리보기 셋팅
 * @param (1): 미리보기할 파일 정보
 * @param (2): 파일 여러 개 여부 flag
 *******************************/
function setPreviewFix(file: any, type: 'single' | 'multi') {
  if (!file) return
  // 이미지인  경우
  if (file.attachFileId) {
    if (type === 'single') {
      previewfix.value.fileList = []
    }
    $http({
      url: previewUrl.value,
      method: 'GET',
      params: {
        attachFileId: file.attachFileId
      }
    }).then((_result: any) => {
      previewfix.value.isShow = true
      previewfix.value.attachFileId = file.attachFileId
      if (type === 'single') {
        previewfix.value.src = 'data:' + file.contentType + ';base64,' + _result.data.data
      } else {
        const curFile = _.find(previewfix.value.fileList, {
          attachFileId: file.attachFileId
        })
        curFile.src = 'data:' + file.contentType + ';base64,' + _result.data.data
      }
      previewfix.value.oriFileNm = file.oriFileNm
      previewfix.value.fileSize = file.fileSize
      previewfix.value.description = file.description
      previewfix.value.fileExt = file.fileExt
    })
  }
}
/******************************
 * TODO (목적): 미리보기 사진 넘기기
 * @param (1): 파일 id (넘길 사진)
 * @param (2): 파일 id (이전 사진)
 *******************************/
function transitionImage(val: string | number, oldVal: string | number) {
  const curFile = _.find(preview.value.fileList, { attachFileId: val })
  if (curFile) {
    setPreview(curFile, 'multi')
  }

  const preFile = _.find(preview.value.fileList, { attachFileId: oldVal })
  if (preFile) {
    preFile.src = preFile.imgUrl
  }
}
/******************************
 * TODO (목적): 파일 삭제
 * @param (1): 삭제할 파일 정보
 *******************************/
function removeFile(file: any) {
  $http({
    url: $format(deleteUrl.value, file.attachFileId),
    method: 'DELETE'
  }).then((_result: any) => {
    if (_result.data.data > 0) {
      $q.notify({
        color: 'positive',
        html: true,
        message: $language('삭제 완료'), // 삭제 완료
        multiLine: true,
        timeout: 5000
      })
      getUploadedFiles()
    }
  })
}
/******************************
 * TODO (목적): 파일 전체 삭제
 *******************************/
function removeAllFiles() {
  $http({
    url: $format(allDeleteUrl.value, props.attachInfo.taskKey, props.attachInfo.taskClassCd),
    method: 'DELETE'
  }).then((_result: any) => {
    if (_result.data.data > 0) {
      $q.notify({
        color: 'positive',
        html: true,
        message: $language('삭제 완료'), // 삭제 완료
        multiLine: true,
        timeout: 5000
      })
      getUploadedFiles()
    }
  })
}
/******************************
 * TODO (목적): CUpload를 직접 호출해 사용할 method
 *******************************/
function removeAllFilesMethod() {
  $http({
    url: $format(allDeleteUrl.value, props.attachInfo.taskKey, props.attachInfo.taskClassCd),
    method: 'DELETE'
  }).then((_result: any) => {
    if (_result.data > 0) {
      getUploadedFiles()
    }
  })
}
/******************************
 * TODO (목적): 개정 시 이전버전에 있는 파일정보를 복사하는 기능
 * @param (1): 복사할 파일 정보
 *******************************/
function copyFile(file: any) {
  $http({
    url: fileCopyUrl.value,
    method: 'POST',
    data: {
      taskClassCd: props.attachInfo.taskClassCd,
      taskKey: props.attachInfo.taskKey,
      attachFileId: file.attachFileId
    }
  }).then((_result) => {
    $q.notify({
      color: 'positive',
      html: true,
      message: $language('복사 완료'), // 복사 완료
      multiLine: true,
      timeout: 5000
    })
    getUploadedFiles()
  })
}
/******************************
 * TODO (목적): 첨부파일 설명 저장
 * @param (1): 파일 정보
 *******************************/
function descriptionSave(file: any) {
  file.modId = user.value.memberId
  $http({
    url: updateUrl.value,
    method: 'PUT',
    data: file
  }).then(() => {
    $q.notify({
      color: 'teal-4',
      html: true,
      message: `설명란 저장완료.`,
      caption: `[${file.oriFileNm}]`,
      multiLine: true,
      timeout: 2000
    })
    getUploadedFiles()
  })
}
/******************************
 * TODO (목적): props로 attachInfo를 받는경우(components로 import된 곳과 attachInfo가 선언된 곳이 다른 경우) 파일 업로드 후 반환
 * @param (1):
 * @param (2):
 * @return (반환):
 *******************************/
function submitFile() {
  return new Promise((_resolve, _reject) => {
    loading.loadingShow()
    if (fileList.value && fileList.value.length > 0) {
      _.forEach(fileList.value, (file: any) => {
        file.taskKey = props.attachInfo.taskKey
      })
    }
    // 첨부 저장하는 단계
    $http({
      url: tempTaskKeyUpdateUrl.value,
      method: 'PUT',
      data: fileList.value
    })
      .then((_result: any) => {
        if (_result.data.data) {
          // 신규로 등록됨에 따라 임시로 만든 taskKey를 반환처리
          getUploadedFiles()
          loading.loadingHide()
          _resolve(true)
        }
      })
      .catch(() => {
        loading.loadingHide()
        _reject(true)
      })
  })
}

/******************************
 * @Provide_선언
 *  ! types 폴더에 type 명시
 *******************************/
defineExpose({ removeAllFilesMethod, submitFile })
</script>
