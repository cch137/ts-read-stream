export async function readStream(
  stream?: ReadableStream<Uint8Array> | null
): Promise<Uint8Array> {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader();
  const buffers: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffers.push(value);
  }
  const array = new Uint8Array(
    buffers.reduce((size, arr) => size + arr.length, 0)
  );
  let offset = 0;
  for (const buffer of buffers) {
    array.set(buffer, offset);
    offset += buffer.length;
  }
  return array;
}

export async function readString(
  stream?: ReadableStream<Uint8Array> | null,
  encoding = "utf-8"
): Promise<string> {
  return new TextDecoder(encoding).decode(await readStream(stream));
}

export async function readJSON(stream?: ReadableStream<Uint8Array> | null) {
  try {
    return JSON.parse(await readString(stream));
  } catch {}
  return undefined;
}

export const toReadableStream = (value: Uint8Array) => {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(value);
      controller.close();
    },
  });
};

export default readStream;
