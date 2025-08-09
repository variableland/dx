export interface ToolService {
  execute(args: string[]): Promise<void>;
}
