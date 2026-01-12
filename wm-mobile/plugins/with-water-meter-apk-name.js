const { withAppBuildGradle } = require('expo/config-plugins');

const APK_NAME_BLOCK = `    applicationVariants.all { variant ->
        if (variant.buildType.name == "release") {
            variant.outputs.all { output ->
                outputFileName = "WaterMeter_v${variant.versionName}.apk"
            }
        }
    }
`;

const withWaterMeterApkName = (config) =>
  withAppBuildGradle(config, (configResult) => {
    if (configResult.modResults.contents.includes('WaterMeter_v${variant.versionName}.apk')) {
      return configResult;
    }

    configResult.modResults.contents = configResult.modResults.contents.replace(
      /(\n\s*signingConfigs\s*\{)/,
      `\n${APK_NAME_BLOCK}$1`
    );
    return configResult;
  });

module.exports = withWaterMeterApkName;
