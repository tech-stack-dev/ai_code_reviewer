import OpenAI from "openai";

export type UploadedOpenAiFile = Promise<OpenAI.Files.FileObject & {
    _request_id?: string | null;
}>