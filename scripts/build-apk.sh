#GET VERSION AND BUILD NUMS
PACKAGE_VERSION=$(./scripts/version-num.sh ./package.json)
BUILD_NUMBER=$(./scripts/build-num.sh ./package.json)

# $1 is an argument which can be of type "staging | dev | prod"
# inorder to  match the "yarn commands in package json"

ENV_ARG=${1:-staging}

#SET ENVIRONMENT
yarn env:$ENV_ARG

#BUILD
cd android
./gradlew clean
rm -rf app/src/main/res/drawable-*
rm -rf app/src/main/res/raw
./gradlew assembleRelease --no-daemon -Dorg.gradle.jvmargs=-XX:+UseContainerSupport
cd ..

#MOVE FILE
ORIG_DIR="android/app/build/outputs/apk/release"
mkdir -p build
mv "${ORIG_DIR}/app-release.apk" "build/opacity_${ENV_ARG}_${PACKAGE_VERSION}_${BUILD_NUMBER}.apk"
