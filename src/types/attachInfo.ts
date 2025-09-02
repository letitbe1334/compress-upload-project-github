export type attachSettingType = {
  isSubmit: stringNull
  taskClassCd: stringNull
  taskKey: stringNull
  beforeTaskKey?: stringNull
  isRev?: boolean
}

export type attachInfoPictureType = {
  isSubmit: stringNull
  task: Array<attachInfoPictureTaskType>
}

export type attachInfoPictureTaskType = {
  taskClassCd: stringNull
  taskKey: stringNull
}

export type attachFileType = {
  attachFileId: number
  taskClassCd: string
  taskKey: string
  oriFileNm: string
  saveFileNm: string
  fileExt: string
  fileSize: number
  filePhysicalPath: string
  fileDownPath: string
  contentType: string
  description: string
  previewImage: string
  imgUrl?: string
}