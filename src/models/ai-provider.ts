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
   * a helper link to the docs on how to get an api key.
   */

  apiKeyHelpUrl?: string;

  /**
   * The default model used by the provider if no specific model is requested.
   */
  model?: string;

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
   * Check if api key is valid
   */

  checkApiKey(): Promise<boolean>;

  /**
   * Sets the default model for the provider.
   * @param model - The name of the model to set as the default.
   */
  setModel(model: string): Promise<void>;

  /**
   * Executes a prompt using the specified model and returns the generated response.
   * @param prompt - The prompt or input text to process.
   * @param model - (Optional) The name of the model to use; uses model if not provided.
   * @returns A promise that resolves to the generated response as a string.
   */
  runPrompt(prompt: string, model?: string): Promise<string>;
}
