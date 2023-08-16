export class ExitError extends Error {
  constructor(public code: number) {
    super(`Process exited with code ${code}`);
  }
}
