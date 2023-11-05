module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // or specify your target environment
        },
      },
    ],
    '@babel/preset-typescript',
  ],
};