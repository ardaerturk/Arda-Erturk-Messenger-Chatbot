const fs = require('fs')

const configPath = './modules_config/botpress-messenger.json'

let content = JSON.parse(fs.readFileSync(configPath))

content.applicationID = '626012380748827'
content.accessToken = 'EAAI5Wt2UXBsBADCJ58biLMSzV9VxIHhtZC913ailzn2xCZCPsPj5H51T0ZAXJZAgl7WIAhsN1XS44gEqWetcJ9EWcEFXZC2kRGgL6hAtjv3kpZBLWEiRFLsfYKeAXZAoZCkfdqD0c9l15ZCQeGWEYIRphYkcSePlx2BRonJpXth7QRgZDZD'
content.error = ''
content.message = ''
content.verifyToken = '1234567890'
content.connected = false

fs.writeFileSync(configPath, JSON.stringify(content))
