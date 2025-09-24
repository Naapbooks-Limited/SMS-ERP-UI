const UrlType = {
  TEST: 'TEST',
  LIVE: 'LIVE',
  LOCAL: 'LOCAL'
};

const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

// Select appropriate base URL (local or live)
const baseApiUrl =
  environment === UrlType.LOCAL
    ? process.env.NEXT_PUBLIC_LOCAL_URL_PARAM
    : process.env.NEXT_PUBLIC_LIVE_URL_PARAM;

// Remove trailing 'api/' for document viewer
const viewDocumentUrl = baseApiUrl?.endsWith('api/')
  ? baseApiUrl.replace(/api\/?$/, '')
  : baseApiUrl;

const GlobalProperties = {
  localUrlParam: process.env.NEXT_PUBLIC_LOCAL_URL_PARAM,
  urlParam: process.env.NEXT_PUBLIC_LIVE_URL_PARAM,
  testParam: process.env.NEXT_PUBLIC_TEST_PARAM,
  viewdocument: viewDocumentUrl,
  ezeo_shopmystation: process.env.NEXT_PUBLIC_EZEO_SHOPMYSTATION,
  ezeo_sms_live: process.env.NEXT_PUBLIC_EZEO_SMS_LIVE,
  environment,
};

export default GlobalProperties;
