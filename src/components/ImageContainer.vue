<template>
  <div class="image-container">
    <picture
      v-for="(img) in images"
      :key="img.attachFileId"
      ref="pictureRefs">
      <source :data-srcset="img.fileDownPath + '.avif'" type="image/avif" />
      <source :data-srcset="img.fileDownPath + '.webp'" type="image/webp" />
      <img :data-src="img.fileDownPath + '.' + img.fileExt" alt="이미지" style="width: 25%; height: auto;" />
    </picture>
  </div>
</template>

<script setup lang="ts">
import { attachFileType } from '@/types/attachInfo'

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
  name: 'ImageContainer'
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
const images = ref<Array<attachFileType>>([])
const imageUrl = ref('')
const pictureRefs = ref([])

/******************************
 * @Computed_선언
 *******************************/

/******************************
 * @Watch_선언
 *******************************/

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
function init() {
  imageUrl.value = selectConfig.attach.file.temp.url
  getImages()
}

async function getImages() {
  const response = await $http({
    url: imageUrl.value,
    method: 'GET',
    params: {
      attachFileId: '16'
    }
  })

  images.value = response.data.data
  if (images.value && images.value.length > 0) {
    images.value.forEach((image) => image.fileDownPath = `${import.meta.env.VITE_API_URL}/images/${image.fileDownPath.split('.').slice(0, -1).join('.')}`)
  }

  await nextTick(); // DOM 렌더링 완료 후

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sources = entry.target.querySelectorAll('source');
        sources.forEach(s => s.srcset = s.dataset.srcset!);

        const img = entry.target.querySelector('img');
        if (img) {
          img.src = img.dataset.src!;
        }

        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.1 });

  // pictureRefs는 이미 배열 형태
  pictureRefs.value.forEach(pic => observer.observe(pic));
}

/******************************
 * @Provide_선언
 *  ! types 폴더에 type 명시
 *******************************/
</script>
