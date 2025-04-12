import * as deepl from 'deepl-node';

const authKey = process.env.DEEPL_API as string;
console.log('kluc' + authKey);

const translator = new deepl.Translator(authKey);

async function translateText(
    text: string,
    targetLang: string,
): Promise<string> {
  try {
    const result = await translator.translateText(
        text,
        null,
        targetLang as deepl.TargetLanguageCode,
    );

    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}