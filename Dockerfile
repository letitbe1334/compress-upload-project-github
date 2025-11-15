# ----------------------------------------------------------------------
# Stage 1: Vue Build (Node.js 환경)
# ----------------------------------------------------------------------
FROM node:22-alpine as build 

WORKDIR /app

# 의존성 설치 및 캐시 활용
COPY package.json package-lock.json ./
RUN npm install 

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build 
# 빌드 결과물은 /app/dist에 있다고 가정합니다.

# ----------------------------------------------------------------------
# Stage 2: Production (Nginx 서빙 환경)
# ----------------------------------------------------------------------
# [Nginx 설치] Nginx 공식 이미지를 사용하므로 별도 설치 과정이 필요 없습니다.
FROM nginx:alpine

# [1] Nginx 설정 파일 복사: Health Check 및 SPA 라우팅 로직 포함
COPY nginx.conf /etc/nginx/conf.d/default.conf

# [2] 빌드된 정적 파일 복사
# Stage 1의 /app/dist 결과물을 Nginx의 기본 서빙 경로로 복사합니다.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# 컨테이너 시작 시 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]