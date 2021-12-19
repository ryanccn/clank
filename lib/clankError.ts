export default class ClankError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClankError';
  }
}
