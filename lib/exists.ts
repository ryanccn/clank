export default async (filename: string) => {
  try {
    await Deno.stat(filename);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw e;
    }
  }

  return true;
};
