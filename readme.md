## Setup

### Installation
Run the following commands from project root directory

`yarn prepare:submods`

`yarn prepare:install`

### Set Environment
- For staging environment, run `yarn env:staging` (used for intenal production builds)
- For dev environment, run `yarn env:dev`
- For production environment, run `yarn env:prod`

__IMPORTANT__ Don't edit values in `.env.staging` or `.env.prod`, only edit `.env` file

## Run android
run `yarn android` in terminal

## Run ios
open "ios/opacity.xcworkspace" file in xcode