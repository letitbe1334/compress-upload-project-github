# -----------------------------------------------------
# Stage 1: Build (Frontend App)
# -----------------------------------------------------
FROM node:22-alpine AS build

# 작업 디렉토리 설정
WORKDIR /app

# corepack 활성화 (Yarn Berry 사용을 위해 필수)
RUN corepack enable

RUN yarn set version stable

# 1. 의존성 파일 복사 (파일만)
COPY package.json yarn.lock ./

# 2. Yarn Berry의 PnP 및 캐시 폴더 복사
# .yarn/ 폴더를 워크스페이스 내 .yarn/ 폴더로 복사합니다.
COPY .yarn/ .yarn/
# 기타 PnP 관련 파일도 복사합니다 (예: .pnp.cjs)
COPY .pnp.* ./

# 3. 의존성 설치
RUN yarn install --immutable

# 4. 애플리케이션 빌드
COPY . .
RUN yarn build


# -----------------------------------------------------
# Stage 2: Production (Nginx Service)
# -----------------------------------------------------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]