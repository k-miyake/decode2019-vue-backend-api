import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as request from 'request-promise-native';
import * as uuidv4 from 'uuid/v4';

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  console.log(req.body.target);
  const target = req.query.target || (req.body && req.body.target);
  const subscriptionKey = process.env.TRANSLATOR_TEXT_KEY;
  if (!subscriptionKey) {
    throw new Error(
      'Environment variable for your subscription key is not set.'
    );
  }

  const options: any = {
    method: 'POST',
    baseUrl: 'https://api.cognitive.microsofttranslator.com/',
    url: 'translate',
    qs: {
      'api-version': '3.0',
      to: 'ja'
    },
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
    },
    body: [
      {
        text: target
      }
    ],
    json: true
  };

  const response: request.FullResponse = await request(options);
  const result: TranstatorResult = {
    detectedLanguage: response[0].detectedLanguage.language,
    translatedText: response[0].translations[0].text,
    translatedLanguage: response[0].translations[0].to
  };

  if (target) {
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: result
    };
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    };
  }
};

class TranstatorResult {
  detectedLanguage: string;
  translatedText: string;
  translatedLanguage: string;
}

export default httpTrigger;
