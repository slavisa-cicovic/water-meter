const computeVersionCode = (version) => {
  const parts = String(version)
    .split('.')
    .map((part) => parseInt(part, 10))
    .filter((value) => Number.isFinite(value));
  while (parts.length < 3) {
    parts.push(0);
  }
  return parts[0] * 10000 + parts[1] * 100 + parts[2];
};

module.exports = ({ config }) => {
  const version = config.version || '1.0.0';
  const androidVersionCode = config.android?.versionCode ?? computeVersionCode(version);
  const pluginPath = './plugins/with-water-meter-apk-name';
  const plugins = config.plugins ? [...config.plugins] : [];
  const hasPlugin = plugins.some((plugin) =>
    Array.isArray(plugin) ? plugin[0] === pluginPath : plugin === pluginPath
  );

  if (!hasPlugin) {
    plugins.push(pluginPath);
  }

  return {
    ...config,
    android: {
      ...config.android,
      versionCode: androidVersionCode,
    },
    plugins,
  };
};
