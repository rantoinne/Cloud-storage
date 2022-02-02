#GET VERSION AND BUILD NUMS
PACKAGE_VERSION=$(./scripts/version-num.sh ./package.json)
BUILD_NUMBER=$(./scripts/build-num.sh ./package.json)

#SET ENVIRONMENT
yarn env:staging

#BUILD
cd android
./gradlew clean
rm -rf app/src/main/res/drawable-*
rm -rf app/src/main/res/raw
./gradlew bundleRelease
cd ..

#MOVE FILE
ORIG_DIR="android/app/build/outputs/bundle/release"
mkdir -p build
mv "${ORIG_DIR}/app-release.aab" "build/opacity_${PACKAGE_VERSION}_${BUILD_NUMBER}.aab"
