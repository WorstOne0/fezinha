// Static Pix "BR Code" (EMV QR) per the Banco Central manual: id + 2-digit length + value, closed by a CRC16.
const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
};

// Name and city must be plain ASCII, at most 25 and 15 characters.
const ascii = (text: string, max: number) => text.normalize("NFD").replace(/[^\x20-\x7e]/g, "").slice(0, max);

export const pixPayload = (key: string, name: string, city: string, amount?: number) => {
  const payload = [
    field("00", "01"),
    field("26", field("00", "br.gov.bcb.pix") + field("01", key)),
    field("52", "0000"),
    field("53", "986"),
    amount ? field("54", amount.toFixed(2)) : "",
    field("58", "BR"),
    field("59", ascii(name, 25)),
    field("60", ascii(city, 15)),
    field("62", field("05", "***")),
    "6304",
  ].join("");

  return payload + crc16(payload);
};
