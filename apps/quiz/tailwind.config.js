const config = require('@bluenote/config/tailwind')

module.exports = {
  ...config,
  content: [
    './src/**/*.{js,jsx}',
    '../../packages/ui/src/**/*.{js,jsx}'
  ]
}