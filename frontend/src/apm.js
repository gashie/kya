import { init as initApm } from '@elastic/apm-rum'

const apm = initApm({

  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'Gh-Card-KYC-FRONTEND',

  // Set custom APM Server URL (default: http://localhost:8200)
  secretToken: 'Mhqvjvd6oP7pFTT4lp',

 serverUrl: 'https://384ded15058347c9b004fc7fa2d71164.apm.westus2.azure.elastic-cloud.com:443',

  // Set service version (required for sourcemap feature)
  serviceVersion: '1.0.0',
   logLevel:debug

})

export default apm;