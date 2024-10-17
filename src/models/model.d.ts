export interface AiProvider {
  /**
   * The name of the AI provider.
   */
  name: string;

  /**
   * The API key used for authentication with the AI provider.
   */
  apiKey?: string;

  /**
   * Indicates whether an API key is required for authentication.
   */

  apiKeyRequired: boolean;

  /**
   * The default model used by the provider if no specific model is requested.
   */
  defaultModel?: string;

  /**
   * Initializes the AI provider by performing any necessary setup or authentication.
   */
  init(): Promise<void>

  /**
   * Returns a list of available models.
   */
  getModels(): Promise<string[]>;

  /**
   * Sets the API key for authentication.
   * @param key - The API key to authenticate requests.
   */
  setApiKey(key: string): Promise<void>;

  /**
   * Sets the default model for the provider.
   * @param model - The name of the model to set as the default.
   */
  setDefaultModel(model: string): Promise<void>;

  /**
   * Executes a prompt using the specified model and returns the generated response.
   * @param prompt - The prompt or input text to process.
   * @param model - (Optional) The name of the model to use; uses defaultModel if not provided.
   * @returns A promise that resolves to the generated response as a string.
   */
  runPrompt(prompt: string, model: string): Promise<string>;
}
