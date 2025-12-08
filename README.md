# Baby Growth Tracker App

A React Native (TypeScript) application for tracking infant growth, storing measurements locally, computing WHO percentiles, and visualizing progress using interactive charts.

This app was built as part of a take-home assignment and focuses heavily on clean architecture, maintainable code, modular utilities, and real-world features found in pediatric growth apps.

# 🚀 Features
✔ Baby Profile

Name, birth date, gender

Auto-seed sample measurements for easier chart preview

✔ Record Measurements

Weight (kg/lb)

Height/Length (cm/in)

Head circumference (cm/in)

Auto-calculate age in days

Auto-calculate WHO percentiles using LMS (Z-score)

Edit & delete measurement entries

✔ Visual Growth Charts

Weight-for-Age

Height-for-Age

Head-Circumference-for-Age

Smooth line plots + child’s own data points

✔ Local Storage (AsyncStorage)

Schema-versioned JSON storage

Migration-friendly persistence layer

✔ Clean Architecture

Context-based global store

WHO LMS calculation utilities

Strong TypeScript definitions

Separated presentation + logic

🛠 Tech Stack
Layer	Library
UI	React Native + TypeScript
Forms	react-hook-form + Yup
Navigation	@react-navigation/native + native-stack
State	React Context
Storage	@react-native-async-storage/async-storage
Charts	react-native-chart-kit
Date utils	dayjs
WHO LMS Percentiles	Custom LMS interpolation utilities
Testing	Jest + @testing-library/react-native
Lint / Format	ESLint + Prettier

 
# Installation & Running the App
1️⃣ Clone the repository
git clone https://github.com/SHASWATprakash/BabyGrowthTracker.git
cd BabyGrowthTracker

Using yarn:

yarn install


Using npm:

npm install

iOS (macOS)

Install CocoaPods and pods:

# yarn
cd ios && pod install --repo-update && cd ..

# npm
cd ios && pod install --repo-update && cd ..


Run app:

Using yarn:

yarn start                # start metro
yarn ios                  # run iOS simulator
yarn android              # run Android emulator/device


Using npm:

npm run start
npm run ios
npm run android

package.json — required scripts

Include these scripts in package.json. I show both yarn and npm usages above (scripts are identical; run via yarn <script> or npm run <script>).

{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "clean": "watchman watch-del-all && rm -rf node_modules && rm -rf /tmp/metro-* && rm -rf ios/Pods && rm -rf android/.gradle",
    "pod-install": "cd ios && pod install --repo-update && cd .."
  }
}


Use yarn ios / yarn android or npm run ios / npm run android.

Setup checklist (what to do after cloning)

yarn install (or npm install)

Add WHO JSONs: place who-weight-age.json, who-length-age.json, who-head-age.json into src/data/ (the tools folder includes a converter; you can also upload official WHO XLSX and run node tools/convert-who-to-json.js ...).

For iOS: cd ios && pod install --repo-update && cd ..

yarn start --reset-cache then yarn ios or yarn android.

App Architecture (short)

State: React Context (AppProvider) for babyProfile + measurements. Exposes add/update/delete + persistence helpers.

Persistence: @react-native-async-storage/async-storage with a single schema version key (baby-growth-tracker:v1). Migration hooks prepared for future schema changes.

Forms: react-hook-form + @hookform/resolvers/yup + Yup for validation. Forms use typed resolver generics for full TypeScript safety.

Percentiles: LMS interpolation + lmsToZ → zToPercentile. Utilities live in src/utils/lms.ts and src/utils/percentiles.ts.

Charts: react-native-chart-kit (line + scatter) rendered in src/components/charts/*.

Navigation: @react-navigation/native + @react-navigation/native-stack — stack: Profile | AddMeasurement | History | Charts | EditMeasurement.

# Why React-Native-Chart-Kit
Originally, Victory was planned for charts.
However, React Native 0.82.x + Victory Native introduced major problems:

❌ Fatal Issues with Victory Native

Hard dependency on @shopify/react-native-skia — RN 0.82 does not support these versions.

Hard dependency on react-native-reanimated — mismatched versions causing pod crashes.

SVG path parsing errors (NaN issues).

iOS build failures due to incompatible Reanimated + Worklets versions.

Victory removed support for older RN architectures.

✔ Final Decision: Use react-native-chart-kit

react-native-chart-kit works out-of-the-box, requires only react-native-svg, and is extremely stable.

Library	Why Not Used?	Why Used?
Victory	❌ RN 0.82 incompatible, pod failures, Skia + Reanimated conflicts	—
react-native-chart-kit	—	✔ Simple ✔ Stable ✔ Zero native issues ✔ Great for line + scatter charts

Conclusion:
For reliability and successful assignment delivery, react-native-chart-kit is the correct choice.