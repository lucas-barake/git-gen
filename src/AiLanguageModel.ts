import {
  FetchHttpClient,
  HttpBody,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Config, Effect, Redacted, Schedule, Schema } from "effect";
import type { JsonSchema7Root } from "effect/JSONSchema";

const makeSchemaFromResponse = <A, I>(schema: Schema.Schema<A, I>) =>
  Schema.Struct({
    candidates: Schema.Tuple(
      Schema.Struct({
        content: Schema.Struct({
          parts: Schema.Tuple(
            Schema.Struct({
              parsed: Schema.parseJson(schema).pipe(
                Schema.propertySignature,
                Schema.fromKey("text"),
              ),
            }),
          ),
        }),
      }),
    ),
  });

export interface GenerateObjectOptions<A, I extends Record<string, unknown>> {
  readonly prompt: string;
  readonly schema: Schema.Schema<A, I>;
  readonly responseSchema: JsonSchema7Root;
}

export class AiLanguageModel extends Effect.Service<AiLanguageModel>()("AiLanguageModel", {
  dependencies: [FetchHttpClient.layer],
  effect: Effect.gen(function* () {
    const apiKey = yield* Config.redacted("GOOGLE_AI_API_KEY");
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest((request) =>
        request.pipe(HttpClientRequest.setHeader("x-goog-api-key", Redacted.value(apiKey))),
      ),
      HttpClient.tap((response) => response.text.pipe(Effect.flatMap(Effect.log))),
      HttpClient.retryTransient({
        times: 3,
        schedule: Schedule.exponential("1 second", 2),
      }),
    );

    const generateObject = <A, I extends Record<string, unknown>>(
      options: GenerateObjectOptions<A, I>,
    ) =>
      Effect.gen(function* () {
        const { prompt, responseSchema, schema } = options;

        const response = yield* httpClient
          .post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
            {
              body: HttpBody.unsafeJson({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  response_mime_type: "application/json",
                  response_schema: responseSchema,
                },
              }),
            },
          )
          .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(makeSchemaFromResponse(schema))));

        return response.candidates[0].content.parts[0].parsed;
      }).pipe(Effect.withSpan("AiLanguageModel.generateObject"));

    return {
      generateObject,
    } as const;
  }),
}) {}
